"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type Product = {
  id: string;
  name: string;
  priceCents: number;
  stock: number;
  active: boolean;
};

type ProductSale = {
  id: string;
  productId: string;
  barberName: string;
  quantity: number;
  paid: boolean;
  createdAt: string;
};

type Summary = {
  unpaidTotalCents: number;
  unpaidByBarber: Record<string, number>;
  unpaidCount: number;
};

type AdminData = {
  products: Product[];
  sales: ProductSale[];
  summary: Summary;
};

function formatMoney(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function AdminProductsClient({ authKey }: { authKey?: string }) {
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("0");
  const [saving, setSaving] = useState(false);

  const query = authKey ? `?key=${encodeURIComponent(authKey)}` : "";

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/product-sales${query}`);
      if (!res.ok) throw new Error("Could not load retail data.");
      setData(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Load failed.");
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    void load();
  }, [load]);

  const addProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const priceCents = Math.round(parseFloat(price) * 100);
      if (!name.trim() || Number.isNaN(priceCents)) {
        throw new Error("Enter a product name and valid price.");
      }
      const res = await fetch(`/api/products${query}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          priceCents,
          stock: parseInt(stock, 10) || 0,
        }),
      });
      if (!res.ok) throw new Error("Could not save product.");
      setName("");
      setPrice("");
      setStock("0");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const markPaid = async (id: string) => {
    const res = await fetch(`/api/product-sales${query}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "mark-paid", id }),
    });
    if (!res.ok) {
      setError("Could not mark sale paid.");
      return;
    }
    await load();
  };

  const productName = (id: string) => data?.products.find((p) => p.id === id)?.name ?? "Unknown";
  const productPrice = (id: string) => data?.products.find((p) => p.id === id)?.priceCents ?? 0;

  return (
    <div className="space-y-10">
      {error && <p className="text-sm text-burgundy">{error}</p>}
      {loading && <p className="text-sm text-charcoal/50">Loading…</p>}

      {data && (
        <>
          <section className="rounded-2xl border border-charcoal/10 bg-bone p-6">
            <h2 className="font-serif text-2xl text-charcoal">Weekly balance</h2>
            <p className="mt-1 text-sm text-charcoal/60">
              Unpaid barber purchases — settle in cash or Venmo, then mark paid.
            </p>
            <p className="mt-4 text-3xl font-semibold text-charcoal">
              {formatMoney(data.summary.unpaidTotalCents)}
              <span className="ml-2 text-base font-normal text-charcoal/50">
                ({data.summary.unpaidCount} sale{data.summary.unpaidCount === 1 ? "" : "s"})
              </span>
            </p>
            {Object.keys(data.summary.unpaidByBarber).length > 0 && (
              <ul className="mt-4 space-y-1 text-sm text-charcoal/80">
                {Object.entries(data.summary.unpaidByBarber).map(([barber, cents]) => (
                  <li key={barber} className="flex justify-between gap-4">
                    <span>{barber}</span>
                    <span className="font-medium">{formatMoney(cents)}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h2 className="font-serif text-2xl text-charcoal">Add product</h2>
            <form onSubmit={(e) => void addProduct(e)} className="mt-4 grid gap-3 sm:grid-cols-4">
              <input
                type="text"
                placeholder="Product name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-lg border border-charcoal/15 bg-bone px-3 py-2 text-charcoal sm:col-span-2"
              />
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="Retail price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="rounded-lg border border-charcoal/15 bg-bone px-3 py-2 text-charcoal"
              />
              <input
                type="number"
                min="0"
                placeholder="Stock"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="rounded-lg border border-charcoal/15 bg-bone px-3 py-2 text-charcoal"
              />
              <button
                type="submit"
                disabled={saving}
                className="rounded-full bg-charcoal px-4 py-2 text-sm font-medium text-bone hover:bg-charcoal/90 disabled:opacity-50 sm:col-span-4 sm:w-fit"
              >
                {saving ? "Saving…" : "Add product"}
              </button>
            </form>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-charcoal">Inventory</h2>
            <div className="mt-4 overflow-x-auto rounded-xl border border-charcoal/10">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-charcoal/5 text-charcoal/70">
                  <tr>
                    <th className="px-4 py-3 font-medium">Product</th>
                    <th className="px-4 py-3 font-medium">Price</th>
                    <th className="px-4 py-3 font-medium">Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {data.products.map((p) => (
                    <tr key={p.id} className="border-t border-charcoal/10">
                      <td className="px-4 py-3 text-charcoal">{p.name}</td>
                      <td className="px-4 py-3 text-charcoal/80">{formatMoney(p.priceCents)}</td>
                      <td className="px-4 py-3 text-charcoal/80">{p.stock}</td>
                    </tr>
                  ))}
                  {data.products.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-4 py-6 text-center text-charcoal/50">
                        No products yet — add your retail lineup above.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-charcoal">Recent sales</h2>
            <div className="mt-4 space-y-2">
              {data.sales.slice(0, 50).map((sale) => {
                const lineTotal = productPrice(sale.productId) * sale.quantity;
                return (
                  <div
                    key={sale.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-charcoal/10 px-4 py-3"
                  >
                    <div>
                      <p className="font-medium text-charcoal">
                        {sale.barberName} — {productName(sale.productId)} ×{sale.quantity}
                      </p>
                      <p className="text-xs text-charcoal/50">
                        {new Date(sale.createdAt).toLocaleString()} · {formatMoney(lineTotal)}
                      </p>
                    </div>
                    {sale.paid ? (
                      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold uppercase text-green-800">
                        Paid
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => void markPaid(sale.id)}
                        className="rounded-full border border-charcoal/15 px-3 py-1 text-xs font-medium text-charcoal hover:border-brass"
                      >
                        Mark paid
                      </button>
                    )}
                  </div>
                );
              })}
              {data.sales.length === 0 && (
                <p className="text-sm text-charcoal/50">No sales logged yet.</p>
              )}
            </div>
          </section>
        </>
      )}

      <div className="text-center text-xs text-charcoal/45">
        <Link href="/shop-log" className="text-brass hover:underline">
          Barber log page
        </Link>
        {" · "}
        <Link href="/hub/appointments" className="text-brass hover:underline">
          Appointments
        </Link>
        {" · "}
        <Link href="/hub/notifications" className="text-brass hover:underline">
          Notifications
        </Link>
      </div>
    </div>
  );
}
