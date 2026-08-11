# Booking Agent

Portable AI booking assistant for barbershops, salons, and similar appointment-based businesses. Drop it into any Next.js site with a config file — no hardcoded business logic.

## Structure

```
src/lib/booking-agent/
  types.ts        — BookingAgentConfig, response types
  format.ts       — Human-readable day/time labels (never null)
  availability.ts — Slot parsing + alternative suggestions
  fallback.ts     — Rule-based flow when OpenAI is unavailable
  agent.ts        — OpenAI + tool calling (check_availability)
  index.ts        — createBookingAgent(config)
```

## Plug into any Next.js site (3 steps)

### 1. Copy the module + add site config

Copy `src/lib/booking-agent/` into your project, then create `src/lib/booking-config.ts`:

```ts
import type { BookingAgentConfig } from "@/lib/booking-agent";

export const MY_SHOP_CONFIG: BookingAgentConfig = {
  businessName: "My Barbershop",
  address: "123 Main St",
  phone: "(555) 555-0100",
  timezone: "America/Los_Angeles",
  hours: [
    { day: "Monday", hours: "9:00 AM – 6:00 PM" },
    { day: "Tuesday", hours: "Closed" },
    // ...
  ],
  services: [
    { name: "Haircut", price: "$40", time: "45 min", description: "..." },
  ],
  extraServiceNames: ["Kids Haircut"],
  tone: "Friendly front-desk vibe.",
};
```

### 2. Wire an API route

```ts
// src/app/api/booking-chat/route.ts
import { createBookingAgent } from "@/lib/booking-agent";
import { MY_SHOP_CONFIG } from "@/lib/booking-config";
import { checkAvailability, parsePreferredSlot } from "@/lib/appointments-store";

const agent = createBookingAgent(MY_SHOP_CONFIG);

export async function POST(req: Request) {
  const { messages } = await req.json();
  const result = await agent.handleMessage(messages, {
    checkAvailability,
    canParseSlot: (day, time) => parsePreferredSlot(day, time) !== null,
  });
  return Response.json(result);
}
```

Implement `checkAvailability` against your appointments store (see `appointments-store.ts` in this repo).

### 3. Add the chat UI

Point your chat component at `/api/booking-chat`. On `readyToSubmit: true`, POST to your appointment endpoint and show a receipt.

```tsx
// Minimal pattern
const res = await fetch("/api/booking-chat", {
  method: "POST",
  body: JSON.stringify({ messages }),
});
const data = await res.json();
// data.reply, data.phase, data.readyToSubmit, data.alternatives
```

## AI vs fallback

| Path | When | Behavior |
|------|------|----------|
| **AI (primary)** | `OPENAI_API_KEY` set and API responds | GPT-4o-mini with `check_availability` tool; server validates slots before confirming |
| **Fallback** | No key, 429, or API error | Rule-based flow in `fallback.ts` — same phases, never shows null labels |

Set `OPENAI_API_KEY` in `.env.local`. The agent degrades gracefully when credits are exhausted.

## Chat flow

1. Greet → ask service ("cut", "fade", "3 kids")
2. Ask day/time (or parse if given together)
3. Check availability → suggest 3 alternatives with labels like "Today", "Tomorrow", "Saturday Aug 9"
4. Name → phone → confirm summary
5. Submit appointment request → show receipt

## Environment

```env
OPENAI_API_KEY=sk-...   # optional; fallback works without it
```

## Test fallback locally

```bash
npx tsx scripts/test-booking-fallback.ts
```
