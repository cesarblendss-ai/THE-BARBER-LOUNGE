export type ChatMessage = { role: "user" | "assistant"; content: string };

export type ServiceItem = {
  name: string;
  price: string;
  time: string;
  description: string;
};

export type HoursEntry = {
  day: string;
  hours: string;
};

export type BookingAgentConfig = {
  businessName: string;
  address: string;
  phone: string;
  timezone?: string;
  hours: HoursEntry[];
  services: ServiceItem[];
  /** Optional extra services the bot should understand (e.g. kids cuts). */
  extraServiceNames?: string[];
  tone?: string;
  notificationTopic?: string;
};

export type ParsedSlot = {
  date: string;
  hour: number;
  displayDay: string;
  displayTime: string;
};

export type AvailabilityResult = {
  available: boolean;
  slot: ParsedSlot | null;
  reason?: "closed_or_invalid" | "booked";
  alternatives?: ParsedSlot[];
};

export type BookingChatPhase =
  | "service"
  | "schedule"
  | "availability"
  | "name"
  | "phone"
  | "confirm"
  | "submit";

export type BookingChatResponse = {
  reply: string;
  readyToBook: boolean;
  readyToSubmit: boolean;
  service: string | null;
  preferredDay: string | null;
  preferredTime: string | null;
  guestCount: number | null;
  customerName: string | null;
  customerPhone: string | null;
  available: boolean | null;
  alternatives: Array<{ label: string; day: string; time: string }>;
  phase: BookingChatPhase;
};

export type CheckAvailabilityFn = (
  preferredDay: string,
  preferredTime: string,
) => Promise<AvailabilityResult>;

export type BookingAgentHandleOptions = {
  checkAvailability: CheckAvailabilityFn;
  canParseSlot?: (day: string, time: string) => boolean;
};

export type BookingAgent = {
  config: BookingAgentConfig;
  handleMessage: (
    messages: ChatMessage[],
    options: BookingAgentHandleOptions,
  ) => Promise<BookingChatResponse & { aiEnabled: boolean; fallback: boolean }>;
};
