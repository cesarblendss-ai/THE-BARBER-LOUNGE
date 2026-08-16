import { formatAlternativesText, formatSlotSuggestion } from "@/lib/booking-agent/format";
import { SERVICE_HAIRCUT_BEARD, SERVICE_REGULAR } from "@/lib/content";
import type {
  BookingAgentConfig,
  BookingChatResponse,
  ChatMessage,
  CheckAvailabilityFn,
} from "@/lib/booking-agent/types";

const DAY_PATTERN =
  /\b(today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday|this\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)|next\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday))\b/i;

const TIME_PATTERN =
  /\b(\d{1,2}(:\d{2})?\s*(a\.?m\.?|p\.?m\.?)|\d{1,2}\s*(a\.?m\.?|p\.?m\.?)|morning|afternoon|evening|noon)\b/i;

const RELATIVE_TIME_PATTERN =
  /\b(after|before|around|by)\s+(\d{1,2}(:\d{2})?\s*(?:a\.?m\.?|p\.?m\.?)|\d{1,2}\s*(?:a\.?m\.?|p\.?m\.?)|morning|afternoon|evening|noon)\b/i;

const CONFIRM_WORDS =
  /\b(yes|yeah|yep|yup|sure|ok(ay)?|sounds good|looks good|perfect|book it|confirm(ed)?|that works|that['']?s right|correct|let['']?s do it)\b/i;

const GUEST_COUNT_PATTERN =
  /\b(?:for\s+)?(\d+)\s*(?:kids?|children|guests?|people|of them)\b/i;

const CONFIRM_ASK_PATTERN = /sound good|that work|you good with that|what name|phone number/i;
const NAME_ASK_PATTERN = /what name|name for the/i;
const PHONE_ASK_PATTERN = /phone number|best number|reach you/i;

const PHONE_PATTERN =
  /(?:\+?1[\s.-]?)?(?:\(?\d{3}\)?[\s.-]?)\d{3}[\s.-]?\d{4}|\b\d{10}\b/;

const DESIGN_PATTERN =
  /\b(design|pattern|art\s*work|hair\s*design|line\s*art|graphic|freestyle|something\s+creative)\b/i;

const PRICE_PATTERN =
  /\b(how\s+much|what\s+(do\s+you\s+)?charge|price\s*list|pricing|cost\s+of|what\s+.*\s+cost)\b/i;

const FIRST_TIME_PATTERN = /\b(first\s+time|never\s+been|new\s+(here|customer)|first\s+visit)\b/i;

const RESCHEDULE_PATTERN =
  /\b(reschedule|change\s+(my\s+)?time|move\s+(my\s+)?(appt|appointment)|different\s+time)\b/i;

const RUNNING_LATE_PATTERN =
  /\b(running\s+(late|early)|be\s+there\s+in|on\s+my\s+way|few\s+minutes\s+(late|out))\b/i;

function buildServiceKeywords(config: BookingAgentConfig) {
  const confirmed = config.services.filter((s) => !s.name.startsWith("["));
  const names = new Set(confirmed.map((s) => s.name));

  const keywords: Array<{ patterns: RegExp; service: string }> = [
    {
      patterns:
        /\b(haircut\s*(and|&|\+|plus)\s*beard|beard\s*(and|&|\+|plus)\s*haircut|fade\s*(and|&|\+|plus)\s*beard|cut\s*(and|&|\+|plus)\s*beard)\b/i,
      service: SERVICE_HAIRCUT_BEARD,
    },
    {
      patterns: DESIGN_PATTERN,
      service: SERVICE_REGULAR,
    },
    {
      patterns:
        /\b(haircut|cut|cuts|fade|taper|trim|line[- ]?up|shape\s*up|kids?\s*(cut|haircut)|child(ren)?\s*(cut|haircut)|the\s+boys)\b/i,
      service: SERVICE_REGULAR,
    },
  ];

  return { keywords, confirmed, names };
}

function userMessages(messages: ChatMessage[]): string[] {
  return messages.filter((m) => m.role === "user").map((m) => m.content.trim());
}

function matchService(text: string, config: BookingAgentConfig): string | null {
  const { keywords, confirmed } = buildServiceKeywords(config);
  for (const entry of keywords) {
    if (entry.patterns.test(text) && confirmed.some((s) => s.name === entry.service)) {
      return entry.service;
    }
  }

  const byName = confirmed.find((s) => text.toLowerCase().includes(s.name.toLowerCase()));
  return byName?.name ?? null;
}

function extractDay(text: string): string | null {
  const match = text.match(DAY_PATTERN);
  if (!match) return null;
  const value = match[0].trim();
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

function extractTime(text: string): string | null {
  const relativeMatch = text.match(RELATIVE_TIME_PATTERN);
  if (relativeMatch) {
    const prefix = relativeMatch[1].toLowerCase();
    const timePart = relativeMatch[2].trim().replace(/\s+/g, " ");
    return `${prefix} ${timePart}`;
  }

  const match = text.match(TIME_PATTERN);
  if (!match) return null;
  return match[0].trim().replace(/\s+/g, " ");
}

function extractGuestCount(text: string): number | null {
  const match = text.match(GUEST_COUNT_PATTERN);
  if (!match?.[1]) return null;
  const parsed = parseInt(match[1], 10);
  return parsed > 0 ? parsed : null;
}

function extractPhone(text: string): string | null {
  const match = text.match(PHONE_PATTERN);
  return match?.[0]?.trim() ?? null;
}

function extractName(text: string, lastAssistant: string): string | null {
  if (!NAME_ASK_PATTERN.test(lastAssistant)) return null;
  const trimmed = text.trim();
  if (PHONE_PATTERN.test(trimmed)) return null;
  if (CONFIRM_WORDS.test(trimmed) && trimmed.split(/\s+/).length <= 3) return null;
  if (trimmed.length < 2 || trimmed.length > 60) return null;
  if (/\d{3}/.test(trimmed)) return null;
  return trimmed
    .replace(/^(it'?s|i'?m|my name is|this is|name is)\s+/i, "")
    .replace(/\.$/, "")
    .trim();
}

function detectIntent(messages: ChatMessage[], config: BookingAgentConfig) {
  let service: string | null = null;
  let preferredDay: string | null = null;
  let preferredTime: string | null = null;
  let guestCount: number | null = null;
  let customerName: string | null = null;
  let customerPhone: string | null = null;

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    if (msg.role !== "user") continue;
    const text = msg.content.trim();
    const lastAssistant =
      messages
        .slice(0, i)
        .reverse()
        .find((m) => m.role === "assistant")?.content ?? "";

    service = matchService(text, config) ?? service;
    preferredDay = extractDay(text) ?? preferredDay;
    preferredTime = extractTime(text) ?? preferredTime;
    guestCount = extractGuestCount(text) ?? guestCount;
    customerPhone = extractPhone(text) ?? customerPhone;
    customerName = extractName(text, lastAssistant) ?? customerName;
  }

  return { service, preferredDay, preferredTime, guestCount, customerName, customerPhone };
}

function isConfirmation(text: string): boolean {
  return CONFIRM_WORDS.test(text.trim());
}

function casualServicePhrase(service: string, guestCount: number | null): string {
  switch (service) {
    case SERVICE_HAIRCUT_BEARD:
      return "cut and beard";
    case SERVICE_REGULAR:
      if (guestCount && guestCount > 1) return `${guestCount} cuts`;
      return "cut";
    default:
      return service.toLowerCase();
  }
}

function designFollowUpReply(hasDay: boolean, hasTime: boolean): string {
  if (hasDay && !hasTime) {
    return "Bet — design work, got you. What time that day works?";
  }
  if (!hasDay && !hasTime) {
    return "Bet — you thinking a design/pattern in the fade or something freestyle? What day works for you?";
  }
  return "Bet — design work, got you.";
}

function scheduleAskReply(
  service: string,
  guestCount: number | null,
  missingDay: boolean,
  missingTime: boolean,
): string {
  if (missingDay && missingTime) {
    const phrase = casualServicePhrase(service, guestCount);
    if (phrase === "cut") return "Bet — what day and time work for you?";
    return `Got you — ${phrase}. What day and time work for you?`;
  }
  if (missingDay) return "What day works?";
  return "What time you thinking?";
}

function hasExplicitSchedule(text: string): boolean {
  return Boolean(extractDay(text) && extractTime(text));
}

function formatHumanSummary(intent: {
  service: string;
  preferredDay: string;
  preferredTime: string;
  guestCount: number | null;
  customerName?: string | null;
}): string {
  const servicePart = casualServicePhrase(intent.service, intent.guestCount);
  const day = intent.preferredDay.toLowerCase();
  const time = intent.preferredTime.toLowerCase();
  const namePart = intent.customerName ? ` for ${intent.customerName}` : "";
  return `${servicePart}, ${day} ${time}${namePart}`;
}

function emptyResponse(overrides: Partial<BookingChatResponse>): BookingChatResponse {
  return {
    reply: "",
    readyToBook: false,
    readyToSubmit: false,
    service: null,
    preferredDay: null,
    preferredTime: null,
    guestCount: null,
    customerName: null,
    customerPhone: null,
    available: null,
    alternatives: [],
    phase: "service",
    ...overrides,
  };
}

function isDesignRequest(text: string): boolean {
  return DESIGN_PATTERN.test(text);
}

function isPriceQuestion(text: string): boolean {
  return PRICE_PATTERN.test(text);
}

function isFirstTime(text: string): boolean {
  return FIRST_TIME_PATTERN.test(text);
}

function isReschedule(text: string): boolean {
  return RESCHEDULE_PATTERN.test(text);
}

function isRunningLate(text: string): boolean {
  return RUNNING_LATE_PATTERN.test(text);
}

function partialScheduleReply(
  service: string,
  guestCount: number | null,
  day: string | null,
  time: string | null,
): string | null {
  const phrase = casualServicePhrase(service, guestCount);
  const dayLower = day?.toLowerCase() ?? "";
  if (day && !time) {
    if (phrase === "cut") return `Bet — ${dayLower}. What time works?`;
    return `Got you — ${phrase}, ${dayLower}. What time works?`;
  }
  if (!day && time) {
    return `What day were you thinking for ${time.toLowerCase()}?`;
  }
  return null;
}

/** Rule-based booking flow when OpenAI is unavailable. */
export async function ruleBasedBookingReply(
  messages: ChatMessage[],
  config: BookingAgentConfig,
  checkAvailability: CheckAvailabilityFn,
): Promise<BookingChatResponse> {
  const users = userMessages(messages);
  const lastUser = users[users.length - 1] ?? "";
  const intent = detectIntent(messages, config);
  const serviceFromLast = matchService(lastUser, config);
  const dayFromLast = extractDay(lastUser);
  const timeFromLast = extractTime(lastUser);
  const guestFromLast = extractGuestCount(lastUser);

  const priorIntent = detectIntent(
    messages.filter((m) => m.role !== "user" || m.content.trim() !== lastUser),
    config,
  );

  const lastAssistant =
    [...messages].reverse().find((m) => m.role === "assistant")?.content ?? "";
  const alreadyAskedConfirm = CONFIRM_ASK_PATTERN.test(lastAssistant);
  const askedForName = NAME_ASK_PATTERN.test(lastAssistant);
  const askedForPhone = PHONE_ASK_PATTERN.test(lastAssistant);

  const phoneFromLast = extractPhone(lastUser);
  const nameFromLast = extractName(lastUser, lastAssistant);

  if (isRunningLate(lastUser) && intent.service && intent.preferredDay && intent.preferredTime) {
    return emptyResponse({
      reply: "All good — we'll hold your spot. See you soon.",
      service: intent.service,
      preferredDay: intent.preferredDay,
      preferredTime: intent.preferredTime,
      guestCount: intent.guestCount,
      customerName: intent.customerName,
      customerPhone: intent.customerPhone,
      available: true,
      phase: intent.customerName && intent.customerPhone ? "confirm" : intent.customerName ? "phone" : "name",
    });
  }

  if (isReschedule(lastUser)) {
    return emptyResponse({
      reply: "No worries — what day and time work better for you?",
      service: intent.service,
      preferredDay: null,
      preferredTime: null,
      guestCount: intent.guestCount,
      phase: "schedule",
    });
  }

  if (isPriceQuestion(lastUser) && !intent.service) {
    return emptyResponse({
      reply:
        "Regular haircut is $50, cut and beard is $65. What were you thinking, and when do you want to come in?",
      phase: "service",
    });
  }

  if (isFirstTime(lastUser) && !intent.service) {
    return emptyResponse({
      reply:
        "Welcome — you'll be in good hands. What kind of cut are you going for, and when works?",
      phase: "service",
    });
  }

  if (isDesignRequest(lastUser) && !dayFromLast && !timeFromLast) {
    const designService = serviceFromLast ?? SERVICE_REGULAR;
    return emptyResponse({
      reply: designFollowUpReply(Boolean(intent.preferredDay), Boolean(intent.preferredTime)),
      service: designService,
      guestCount: guestFromLast ?? intent.guestCount,
      preferredDay: intent.preferredDay,
      preferredTime: intent.preferredTime,
      phase: intent.preferredDay && !intent.preferredTime ? "schedule" : "schedule",
    });
  }

  if (serviceFromLast && !priorIntent.service && !dayFromLast && !timeFromLast) {
    const phrase = casualServicePhrase(serviceFromLast, guestFromLast ?? intent.guestCount);
    const reply =
      phrase === "cut"
        ? "Bet — what day and time work for you?"
        : `Got you — ${phrase}. What day and time work for you?`;
    return emptyResponse({
      reply,
      service: serviceFromLast,
      guestCount: guestFromLast ?? intent.guestCount,
      phase: "schedule",
    });
  }

  if (!intent.service) {
    return emptyResponse({
      reply:
        "Hey — what are you trying to get done? Regular haircut ($50) or cut and beard ($65)?",
      phase: "service",
    });
  }

  if (!intent.preferredDay || !intent.preferredTime) {
    if (dayFromLast && !intent.preferredDay) intent.preferredDay = dayFromLast;
    if (timeFromLast && !intent.preferredTime) intent.preferredTime = timeFromLast;

    if (!intent.preferredDay || !intent.preferredTime) {
      const missingDay = !intent.preferredDay;
      const missingTime = !intent.preferredTime;
      const partial =
        partialScheduleReply(
          intent.service,
          intent.guestCount,
          intent.preferredDay,
          intent.preferredTime,
        ) ??
        scheduleAskReply(intent.service, intent.guestCount, missingDay, missingTime);

      return emptyResponse({
        reply: partial,
        service: intent.service,
        preferredDay: intent.preferredDay,
        preferredTime: intent.preferredTime,
        guestCount: intent.guestCount,
        phase: "schedule",
      });
    }
  }

  if (!hasExplicitSchedule(lastUser) && !priorIntent.preferredDay && !priorIntent.preferredTime) {
    const phrase = casualServicePhrase(intent.service, intent.guestCount);
    const reply =
      phrase === "cut"
        ? "Bet — what day and time work for you?"
        : `Got you — ${phrase}. What day and time work for you?`;
    return emptyResponse({
      reply,
      service: intent.service,
      guestCount: intent.guestCount,
      phase: "schedule",
    });
  }

  const availability = await checkAvailability(intent.preferredDay, intent.preferredTime);

  if (!availability.available) {
    const altText = formatAlternativesText(availability.alternatives ?? []);
    const reason =
      availability.reason === "closed_or_invalid"
        ? "That time doesn't work for us — "
        : "That slot's taken — ";

    return emptyResponse({
      reply: `${reason}${altText}`,
      service: intent.service,
      preferredDay: intent.preferredDay,
      preferredTime: intent.preferredTime,
      guestCount: intent.guestCount,
      available: false,
      alternatives: (availability.alternatives ?? []).map((s) => ({
        label: formatSlotSuggestion(s),
        day: s.displayDay,
        time: s.displayTime,
      })),
      phase: "availability",
    });
  }

  if (dayFromLast || timeFromLast) {
    intent.preferredDay = availability.slot?.displayDay ?? intent.preferredDay;
    intent.preferredTime = availability.slot?.displayTime ?? intent.preferredTime;
  } else if (availability.slot) {
    intent.preferredDay = availability.slot.displayDay;
    intent.preferredTime = availability.slot.displayTime;
  }

  if (!intent.customerName) {
    if (nameFromLast) intent.customerName = nameFromLast;
    else if (!askedForName) {
      return emptyResponse({
        reply: "That time's open. What name should I put it under?",
        service: intent.service,
        preferredDay: intent.preferredDay,
        preferredTime: intent.preferredTime,
        guestCount: intent.guestCount,
        available: true,
        phase: "name",
      });
    }
  }

  if (!intent.customerPhone) {
    if (phoneFromLast) intent.customerPhone = phoneFromLast;
    else if (!askedForPhone) {
      return emptyResponse({
        reply: `Got it, ${intent.customerName}. What's the best number to reach you?`,
        service: intent.service,
        preferredDay: intent.preferredDay,
        preferredTime: intent.preferredTime,
        guestCount: intent.guestCount,
        customerName: intent.customerName,
        available: true,
        phase: "phone",
      });
    }
  }

  if (isConfirmation(lastUser) && intent.customerName && intent.customerPhone) {
    return emptyResponse({
      reply: "Perfect — locking that in for you now…",
      readyToSubmit: true,
      service: intent.service,
      preferredDay: intent.preferredDay,
      preferredTime: intent.preferredTime,
      guestCount: intent.guestCount,
      customerName: intent.customerName,
      customerPhone: intent.customerPhone,
      available: true,
      phase: "submit",
    });
  }

  const summary = formatHumanSummary({
    service: intent.service,
    preferredDay: intent.preferredDay,
    preferredTime: intent.preferredTime,
    guestCount: intent.guestCount,
    customerName: intent.customerName,
  });

  const isScheduleUpdate =
    alreadyAskedConfirm && (dayFromLast !== null || timeFromLast !== null);

  const opener = isScheduleUpdate ? "Got it —" : "Cool —";
  const endings = ["Sound good?", "That work?", "You good with that?"];
  const ending = endings[summary.length % endings.length];

  return emptyResponse({
    reply: `${opener} ${summary}. ${ending}`,
    service: intent.service,
    preferredDay: intent.preferredDay,
    preferredTime: intent.preferredTime,
    guestCount: intent.guestCount,
    customerName: intent.customerName,
    customerPhone: intent.customerPhone,
    available: true,
    phase: "confirm",
  });
}
