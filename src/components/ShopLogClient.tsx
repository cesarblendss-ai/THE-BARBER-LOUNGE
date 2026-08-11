"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { RETAIL_BARBERS } from "@/lib/retail-config";

type Product = {
  id: string;
  name: string;
  priceCents: number;
  stock: number;
};

type View = "catalog" | "pin" | "log";

const SESSION_KEY = "shop-log-unlocked";

function formatMoney(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function readSessionUnlocked(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(SESSION_KEY) === "1";
}

function writeSessionUnlocked(unlocked: boolean): void {
  if (typeof window === "undefined") return;
  if (unlocked) sessionStorage.setItem(SESSION_KEY, "1");
  else sessionStorage.removeItem(SESSION_KEY);
}

export function ShopLogClient() {
  const [products, setProducts] = useState<Product[]>([]);
  const [pinRequired, setPinRequired] = useState(true);
  const [view, setView] = useState<View>("catalog");
  const [unlockedPin, setUnlockedPin] = useState("");
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState<string | null>(null);
  const [verifyingPin, setVerifyingPin] = useState(false);
  const pinInputRef = useRef<HTMLInputElement>(null);

  const [barberName, setBarberName] = useState("");
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/products?active=1");
      if (!res.ok) throw new Error("Could not load products.");
      const data = (await res.json()) as { products: Product[]; pinRequired?: boolean };
      setProducts(data.products);
      setPinRequired(data.pinRequired ?? true);
      if (data.products.length > 0) {
        setProductId((current) => current || data.products[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Load failed.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (readSessionUnlocked()) {
      setView("log");
    }
  }, []);

  useEffect(() => {
    if (view === "pin") {
      pinInputRef.current?.focus();
    }
  }, [view]);

  const openTeamLog = () => {
    setMessage(null);
    setError(null);
    if (!pinRequired || readSessionUnlocked()) {
      setView("log");
      return;
    }
    setPinInput("");
    setPinError(null);
    setView("pin");
  };

  const verifyPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifyingPin(true);
    setPinError(null);
    try {
      const res = await fetch("/api/retail-log-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: pinInput }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok) {
        throw new Error(data.error === "Wrong code." ? "Wrong team code." : "Could not verify code.");
      }
      setUnlockedPin(pinInput);
      writeSessionUnlocked(true);
      setView("log");
    } catch (err) {
      setPinError(err instanceof Error ? err.message : "Verification failed.");
    } finally {
      setVerifyingPin(false);
    }
  };

  const collapseToCatalog = () => {
    setMessage(null);
    setError(null);
    setView("catalog");
  };

  const lockAndCollapse = () => {
    writeSessionUnlocked(false);
    setUnlockedPin("");
    setPinInput("");
    collapseToCatalog();
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/product-sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pin: unlockedPin || undefined,
          barberName,
          productId,
          quantity,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        throw new Error(data.error === "Invalid PIN." ? "Session expired — enter team code again." : "Could not log sale.");
      }
      setMessage("Logged — pay owner at end of week.");
      setQuantity(1);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submit failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const selected = products.find((p) => p.id === productId);

  return (
    <div className="mx-auto max-w-lg">
      {loading && <p className="text-center text-sm text-charcoal/50">Loading products…</p>}

      {error && view === "catalog" && (
        <p className="text-center text-sm text-burgundy">{error}</p>
      )}

      {!loading && products.length === 0 && (
        <p className="text-center text-sm text-charcoal/50">
          No products in stock right now — check back soon.
        </p>
      )}

      {!loading && products.length > 0 && view === "catalog" && (
        <>
          <p className="text-center text-sm text-charcoal/70">
            Retail products available at the shop. Ask your barber if you&apos;d like to purchase.
          </p>

          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {products.map((p) => (
              <li
                key={p.id}
                className="rounded-xl border border-charcoal/10 bg-bone px-4 py-4 shadow-sm"
              >
                <p className="font-medium text-charcoal">{p.name}</p>
                <p className="mt-1 text-lg font-semibold text-charcoal">{formatMoney(p.priceCents)}</p>
                <p className="mt-1 text-sm text-charcoal/60">
                  {p.stock} left
                </p>
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={openTeamLog}
            className="mt-8 w-full rounded-full border border-brass/40 bg-charcoal py-3.5 text-base font-medium text-bone transition-colors hover:bg-charcoal/90"
          >
            Team log
          </button>
        </>
      )}

      {view === "pin" && (
        <div className="mx-auto max-w-xs">
          <p className="text-center text-sm text-charcoal/70">
            Enter the 4-digit team code to log a product sale.
          </p>

          <form onSubmit={(e) => void verifyPin(e)} className="mt-6 space-y-4">
            <label className="block text-sm text-charcoal/70">
              Team code
              <input
                ref={pinInputRef}
                type="password"
                inputMode="numeric"
                autoComplete="off"
                maxLength={4}
                pattern="\d{4}"
                required
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value.replace(/\D/g, "").slice(0, 4))}
                placeholder="••••"
                className="mt-1 block w-full rounded-xl border border-charcoal/15 bg-bone px-4 py-4 text-center text-2xl tracking-[0.4em] text-charcoal focus:border-brass focus:outline-none focus:ring-1 focus:ring-brass"
              />
            </label>

            {pinError && <p className="text-center text-sm text-burgundy">{pinError}</p>}

            <button
              type="submit"
              disabled={verifyingPin || pinInput.length !== 4}
              className="w-full rounded-full bg-charcoal py-3.5 text-base font-medium text-bone hover:bg-charcoal/90 disabled:opacity-50"
            >
              {verifyingPin ? "Checking…" : "Unlock log"}
            </button>

            <button
              type="button"
              onClick={collapseToCatalog}
              className="w-full rounded-full border border-charcoal/15 py-3 text-sm text-charcoal/70 hover:border-brass/40"
            >
              Back to products
            </button>
          </form>
        </div>
      )}

      {view === "log" && products.length > 0 && (
        <>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-charcoal">Team log</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={collapseToCatalog}
                className="rounded-full border border-charcoal/15 px-3 py-1.5 text-xs text-charcoal/70 hover:border-brass/40"
              >
                View products
              </button>
              {pinRequired && (
                <button
                  type="button"
                  onClick={lockAndCollapse}
                  className="rounded-full border border-charcoal/15 px-3 py-1.5 text-xs text-charcoal/70 hover:border-brass/40"
                >
                  Lock
                </button>
              )}
            </div>
          </div>

          <p className="mt-2 text-sm text-charcoal/70">
            Took something from the cabinet? Log it now — pay the shop weekly.
          </p>

          {message && (
            <p className="mt-4 rounded-xl bg-green-50 px-4 py-3 text-center text-sm text-green-800">
              {message}
            </p>
          )}
          {error && <p className="mt-4 text-center text-sm text-burgundy">{error}</p>}

          <form onSubmit={(e) => void submit(e)} className="mt-6 space-y-5">
            <label className="block text-sm text-charcoal/70">
              Your name
              <select
                required
                value={barberName}
                onChange={(e) => setBarberName(e.target.value)}
                className="mt-1 block w-full rounded-xl border border-charcoal/15 bg-bone px-4 py-3 text-lg text-charcoal focus:border-brass focus:outline-none focus:ring-1 focus:ring-brass"
              >
                <option value="">Select barber…</option>
                {RETAIL_BARBERS.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm text-charcoal/70">
              Product
              <select
                required
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                className="mt-1 block w-full rounded-xl border border-charcoal/15 bg-bone px-4 py-3 text-lg text-charcoal focus:border-brass focus:outline-none focus:ring-1 focus:ring-brass"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — {formatMoney(p.priceCents)} ({p.stock} left)
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm text-charcoal/70">
              Quantity
              <input
                type="number"
                min={1}
                max={selected?.stock ?? 99}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 1)}
                className="mt-1 block w-full rounded-xl border border-charcoal/15 bg-bone px-4 py-3 text-lg text-charcoal focus:border-brass focus:outline-none focus:ring-1 focus:ring-brass"
              />
            </label>

            {selected && (
              <p className="text-center text-sm text-charcoal/60">
                Total: {formatMoney(selected.priceCents * quantity)}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting || !barberName}
              className="w-full rounded-full bg-charcoal py-4 text-lg font-medium text-bone hover:bg-charcoal/90 disabled:opacity-50"
            >
              {submitting ? "Logging…" : "Log sale"}
            </button>
          </form>
        </>
      )}
    </div>
  );
}
