export type EstimateStatus = "created" | "opened" | "signed" | "paid";

export type EstimateLineItem = {
  description: string;
  amountCents: number;
};

export type Estimate = {
  id: string;
  token: string;
  clientName: string;
  lineItems: EstimateLineItem[];
  amountCents: number;
  depositAmountCents: number;
  notes: string;
  status: EstimateStatus;
  openedAt: string | null;
  signedAt: string | null;
  signedName: string | null;
  paidAt: string | null;
  stripeCheckoutSessionId: string | null;
  stripePaymentIntentId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PublicEstimate = {
  clientName: string;
  lineItems: EstimateLineItem[];
  amountCents: number;
  depositAmountCents: number;
  notes: string;
  status: EstimateStatus;
  signedName: string | null;
  signedAt: string | null;
  paidAt: string | null;
};

export type CreateEstimateInput = {
  clientName: string;
  lineItems?: Array<{ description?: string; amountCents?: number; amount?: string | number }>;
  amountCents?: number;
  amount?: string | number;
  depositAmountCents?: number;
  depositAmount?: string | number;
  notes?: string;
};
