import { NextRequest, NextResponse } from "next/server";

import { unauthorizedAdminResponse, verifyAdminKey } from "@/lib/admin-auth";
import { isRetailLogPinRequired, verifyRetailLogPin } from "@/lib/retail-config";
import {
  createProductSale,
  getRetailSummary,
  listProducts,
  listSales,
  markSalePaid,
} from "@/lib/retail-store";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  if (!verifyAdminKey(request)) {
    return unauthorizedAdminResponse();
  }

  const [products, sales, summary] = await Promise.all([
    listProducts(),
    listSales(),
    getRetailSummary(),
  ]);

  return NextResponse.json({ products, sales, summary });
}

export async function POST(request: NextRequest) {
  let body: {
    pin?: string;
    productId?: string;
    barberName?: string;
    quantity?: number;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body." }, { status: 400 });
  }

  if (isRetailLogPinRequired() && !body.pin?.trim()) {
    return NextResponse.json({ error: "Invalid PIN." }, { status: 401 });
  }

  if (!verifyRetailLogPin(body.pin)) {
    return NextResponse.json({ error: "Invalid PIN." }, { status: 401 });
  }

  if (!body.productId || !body.barberName?.trim()) {
    return NextResponse.json({ error: "productId and barberName required." }, { status: 400 });
  }

  const result = await createProductSale({
    productId: body.productId,
    barberName: body.barberName,
    quantity: body.quantity,
  });

  if (!result.ok) {
    const status = result.reason === "insufficient_stock" ? 409 : 404;
    return NextResponse.json({ error: result.reason }, { status });
  }

  return NextResponse.json({ sale: result.sale });
}

export async function PATCH(request: NextRequest) {
  if (!verifyAdminKey(request)) {
    return unauthorizedAdminResponse();
  }

  let body: { action?: "mark-paid"; id?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body." }, { status: 400 });
  }

  if (body.action !== "mark-paid" || !body.id) {
    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  }

  const sale = await markSalePaid(body.id);
  if (!sale) {
    return NextResponse.json({ error: "Sale not found." }, { status: 404 });
  }

  return NextResponse.json({ sale });
}
