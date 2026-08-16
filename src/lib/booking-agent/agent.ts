import { formatAlternativesText, formatSlotSuggestion } from "@/lib/booking-agent/format";
import { ruleBasedBookingReply } from "@/lib/booking-agent/fallback";
import { RECEPTIONIST_TONE_GUIDE } from "@/lib/booking-agent/receptionist-scripts";
import type {
  BookingAgent,
  BookingAgentConfig,
  BookingChatResponse,
  ChatMessage,
  CheckAvailabilityFn,
} from "@/lib/booking-agent/types";

type OpenAiMessage =
  | { role: "system" | "user" | "assistant"; content: string }
  | { role: "assistant"; content: string | null; tool_calls?: ToolCall[] }
  | { role: "tool"; tool_call_id: string; content: string };

type ToolCall = {
  id: string;
  type: "function";
  function: { name: string; arguments: string };
};

const TOOLS = [
  {
    type: "function" as const,
    function: {
      name: "check_availability",
      description:
        "Check whether a day and time slot is open. Always call this before confirming a time with the customer.",
      parameters: {
        type: "object",
        properties: {
          preferredDay: {
            type: "string",
            description: "Day like today, tomorrow, Saturday",
          },
          preferredTime: {
            type: "string",
            description: "Time like 2:00 PM, after 2pm, morning",
          },
        },
        required: ["preferredDay", "preferredTime"],
      },
    },
  },
];

function isAiEnabled(): boolean {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

function buildSystemPrompt(config: BookingAgentConfig): string {
  const serviceLines = config.services
    .filter((s) => !s.name.startsWith("["))
    .map((s) => `- ${s.name}: ${s.price}, ${s.time} — ${s.description}`)
    .join("\n");

  const hoursLines = config.hours.map((h) => `${h.day}: ${h.hours}`).join(", ");
  const tone = config.tone ?? "Short, friendly, human — like a barber shop front desk in Antioch.";

  return `${RECEPTIONIST_TONE_GUIDE}

Business: ${config.businessName} — ${config.address}
Shop phone: ${config.phone}
Hours: ${hoursLines}
${tone}

You receive the FULL conversation history. Use every prior message — never re-ask for info the customer already gave.

The customer was greeted with "Hey — what are you looking to get done?" They type casually (e.g. "design on my hair", "3 kids tomorrow", "fade and beard saturday 2pm").

Booking flow (one step at a time in reply):
1. SERVICE — map to menu internally. "Design/pattern/art" = Regular haircut. Unclear? One short follow-up, not a menu list.
2. DAY & TIME — if not stated, ask when. Never invent a day/time.
3. AVAILABILITY — call check_availability when day+time are known. If taken/closed, offer alternatives from tool — stop before name/phone.
4. NAME — "What name should I put it under?"
5. PHONE — best number to reach them.
6. CONFIRM — recap in casual words (their slang, not menu titles). Ask if it works.
7. SUBMIT — readyToSubmit true only after yes/sounds good/book it.

Internal menu (exact names in JSON "service" field ONLY — never in "reply"):
${serviceLines}

Slang → internal service:
- design, pattern, art, freestyle lines → Regular haircut
- fade, taper, cut, trim, kids cuts → Regular haircut
- fade + beard, cut and beard → Haircut & beard

After check_availability, weave the result in naturally. If unavailable, suggest alternatives from the tool.

Respond with JSON only:
{
  "reply": "your casual message to the customer",
  "readyToBook": false,
  "readyToSubmit": false,
  "service": "internal menu service name, or null",
  "preferredDay": "e.g. Saturday — null if not yet provided",
  "preferredTime": "e.g. 2:00 PM — null if not yet provided",
  "guestCount": "number or null",
  "customerName": "name or null",
  "customerPhone": "phone or null",
  "phase": "service | schedule | availability | name | phone | confirm | submit"
}`;
}

function parseBookingResponse(raw: unknown): BookingChatResponse | null {
  if (!raw || typeof raw !== "object") return null;

  const payload = raw as Record<string, unknown>;
  const reply = payload.reply;

  if (typeof reply !== "string" || !reply.trim()) return null;

  const nullableString = (value: unknown): string | null => {
    if (value === null || value === undefined) return null;
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (!trimmed || trimmed.toLowerCase() === "null") return null;
      return trimmed;
    }
    return null;
  };

  const nullableNumber = (value: unknown): number | null =>
    typeof value === "number" && value > 0 ? value : null;

  const service = nullableString(payload.service);
  const preferredDay = nullableString(payload.preferredDay);
  const preferredTime = nullableString(payload.preferredTime);
  const guestCount = nullableNumber(payload.guestCount);
  const readyToBook = payload.readyToBook === true;
  const readyToSubmit = payload.readyToSubmit === true;
  const customerName = nullableString(payload.customerName);
  const customerPhone = nullableString(payload.customerPhone);
  const phase = nullableString(payload.phase) ?? "service";

  if (readyToSubmit && (!service || !preferredDay || !preferredTime || !customerName || !customerPhone)) {
    return {
      reply: reply.trim(),
      readyToBook: false,
      readyToSubmit: false,
      service,
      preferredDay,
      preferredTime,
      guestCount,
      customerName,
      customerPhone,
      available: null,
      alternatives: [],
      phase: phase as BookingChatResponse["phase"],
    };
  }

  return {
    reply: reply.trim(),
    readyToBook,
    readyToSubmit,
    service,
    preferredDay,
    preferredTime,
    guestCount,
    customerName,
    customerPhone,
    available: null,
    alternatives: [],
    phase: phase as BookingChatResponse["phase"],
  };
}

async function enrichWithAvailability(
  response: BookingChatResponse,
  checkAvailability: CheckAvailabilityFn,
  canParseSlot: (day: string, time: string) => boolean,
): Promise<BookingChatResponse> {
  if (!response.service || !response.preferredDay || !response.preferredTime) {
    return response;
  }

  if (response.phase === "submit" || response.readyToSubmit) {
    return response;
  }

  if (response.phase === "service" || response.phase === "schedule") {
    if (!canParseSlot(response.preferredDay, response.preferredTime)) {
      return {
        ...response,
        preferredDay: null,
        preferredTime: null,
        phase: "schedule",
      };
    }
  }

  if (!canParseSlot(response.preferredDay, response.preferredTime)) {
    return {
      ...response,
      preferredDay: null,
      preferredTime: null,
      phase: "schedule",
      reply:
        response.phase === "schedule"
          ? response.reply
          : "What day and time work for you?",
      available: null,
      alternatives: [],
    };
  }

  const availability = await checkAvailability(response.preferredDay, response.preferredTime);

  if (!availability.available) {
    const altText = formatAlternativesText(availability.alternatives ?? []);
    return {
      ...response,
      available: false,
      readyToSubmit: false,
      readyToBook: false,
      phase: "availability",
      alternatives: (availability.alternatives ?? []).map((s) => ({
        label: formatSlotSuggestion(s),
        day: s.displayDay,
        time: s.displayTime,
      })),
      reply:
        availability.reason === "closed_or_invalid"
          ? `That time doesn't work for us — ${altText}`
          : `That slot's taken — ${altText}`,
      preferredDay: availability.slot?.displayDay ?? response.preferredDay,
      preferredTime: availability.slot?.displayTime ?? response.preferredTime,
    };
  }

  return {
    ...response,
    available: true,
    preferredDay: availability.slot?.displayDay ?? response.preferredDay,
    preferredTime: availability.slot?.displayTime ?? response.preferredTime,
  };
}

async function tryOpenAiReply(
  apiKey: string,
  config: BookingAgentConfig,
  messages: ChatMessage[],
  checkAvailability: CheckAvailabilityFn,
  canParseSlot: (day: string, time: string) => boolean,
): Promise<BookingChatResponse | null> {
  const openAiMessages: OpenAiMessage[] = [
    { role: "system", content: buildSystemPrompt(config) },
    ...messages.map((m) => ({ role: m.role, content: m.content })),
  ];

  for (let round = 0; round < 4; round++) {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: openAiMessages,
        tools: TOOLS,
        tool_choice: "auto",
        max_tokens: 400,
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      console.error("Booking chat OpenAI error:", response.status, detail);
      return null;
    }

    const data = (await response.json()) as {
      choices?: Array<{
        message?: {
          content?: string | null;
          tool_calls?: ToolCall[];
        };
      }>;
    };
    const message = data.choices?.[0]?.message;
    if (!message) return null;

    if (message.tool_calls?.length) {
      openAiMessages.push({
        role: "assistant",
        content: message.content ?? null,
        tool_calls: message.tool_calls,
      });

      for (const call of message.tool_calls) {
        if (call.function.name === "check_availability") {
          let args: { preferredDay?: string; preferredTime?: string } = {};
          try {
            args = JSON.parse(call.function.arguments);
          } catch {
            args = {};
          }

          const day = args.preferredDay?.trim() ?? "";
          const time = args.preferredTime?.trim() ?? "";
          let result;

          if (day && time && canParseSlot(day, time)) {
            result = await checkAvailability(day, time);
          } else {
            result = {
              available: false,
              slot: null,
              reason: "closed_or_invalid" as const,
              alternatives: [],
            };
          }

          openAiMessages.push({
            role: "tool",
            tool_call_id: call.id,
            content: JSON.stringify({
              ...result,
              alternatives: (result.alternatives ?? []).map((s) => ({
                ...s,
                label: formatSlotSuggestion(s),
              })),
            }),
          });
        }
      }
      continue;
    }

    const content = message.content;
    if (!content) return null;

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    try {
      const parsed = parseBookingResponse(JSON.parse(jsonMatch[0]));
      if (!parsed) return null;
      return enrichWithAvailability(parsed, checkAvailability, canParseSlot);
    } catch {
      console.error("Booking chat OpenAI returned invalid JSON:", content);
      return null;
    }
  }

  const finalResponse = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        ...openAiMessages,
        {
          role: "user",
          content:
            "Output your booking assistant response as a single JSON object matching the schema in the system prompt. No markdown.",
        },
      ],
      max_tokens: 400,
      response_format: { type: "json_object" },
    }),
  });

  if (!finalResponse.ok) return null;

  const finalData = (await finalResponse.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const finalContent = finalData.choices?.[0]?.message?.content;
  if (!finalContent) return null;

  try {
    const parsed = parseBookingResponse(JSON.parse(finalContent));
    if (!parsed) return null;
    return enrichWithAvailability(parsed, checkAvailability, canParseSlot);
  } catch {
    return null;
  }
}

export function createBookingAgent(config: BookingAgentConfig): BookingAgent {
  return {
    config,
    async handleMessage(messages, options) {
      const { checkAvailability, canParseSlot = () => true } = options;
      const aiEnabled = isAiEnabled();
      const apiKey = process.env.OPENAI_API_KEY?.trim();

      if (aiEnabled && apiKey) {
        try {
          const aiReply = await tryOpenAiReply(
            apiKey,
            config,
            messages,
            checkAvailability,
            canParseSlot,
          );
          if (aiReply) {
            return { ...aiReply, aiEnabled: true, fallback: false };
          }
          console.warn("Booking chat falling back to rule-based flow (OpenAI unavailable).");
        } catch (error) {
          console.error("Booking chat error:", error);
          console.warn("Booking chat falling back to rule-based flow.");
        }
      }

      const fallback = await ruleBasedBookingReply(messages, config, checkAvailability);
      return { ...fallback, aiEnabled, fallback: true };
    },
  };
}

export type { BookingAgentConfig, BookingChatResponse, ChatMessage };
