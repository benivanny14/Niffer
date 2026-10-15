"use client";

import { useState } from "react";
import { site, waLink } from "@/lib/site";
import { formatTsh } from "@/lib/format";
import { apiPost, errorMessage } from "@/lib/api";
import { ChatIcon, CheckIcon, SparkleIcon } from "@/components/ui/icons";

const amounts = [10000, 25000, 50000, 100000];

const steps = [
  {
    title: "Choose a value",
    description: "Gift cards from TSh 10,000 to TSh 100,000.",
  },
  {
    title: "Payment review and approval",
    description: "We verify your payment and approve the gift card before issuing its code.",
  },
  {
    title: "They can redeem it",
    description: "Recipients can redeem the code on any Niffer order.",
  },
];

export function GiftCardPanel() {
  const [amount, setAmount] = useState(amounts[1]);
  const [recipient, setRecipient] = useState("");
  const [message, setMessage] = useState("");
  const [buyerName, setBuyerName] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("mpesa");
  const [paymentReference, setPaymentReference] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [request, setRequest] = useState<{
    id: string;
    amountTsh: number;
  } | null>(null);

  async function issue() {
    if (sending) return;
    setSending(true);
    setError("");
    try {
      const data = await apiPost<{
        ok: boolean;
        request: { id: string; amountTsh: number };
      }>("/api/giftcards", { amountTsh: amount, buyerName, buyerPhone, recipient, message, paymentMethod, paymentReference });
      setRequest({
        id: data.request.id,
        amountTsh: data.request.amountTsh,
      });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSending(false);
    }
  }

  const waText = `Hello ${site.name}, I would like a gift card worth ${formatTsh(
    amount,
)}.${request ? ` Request: ${request.id}. Payment reference: ${paymentReference}.` : ""}${
    recipient ? ` Recipient: ${recipient}.` : ""
  }${message ? ` Message: ${message}` : ""}`;

  return (
    <div className="grid gap-10 lg:grid-cols-2">
        {/* Choose */}
        <div className="card p-6">
          <h2 className="font-display text-xl text-ink-900">
            1. Choose a card value
          </h2>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {amounts.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setAmount(value)}
                className={`rounded-xl border p-4 text-center transition-colors ${
                  amount === value
                    ? "border-brand-600 bg-brand-50"
                    : "border-cream-300 bg-surface hover:border-brand-300"
                }`}
              >
                <span className="block font-display text-xl text-ink-900">
                  {formatTsh(value)}
                </span>
                <span className="mt-1 block text-xs text-ink-500">
                  {value >= 50000 ? "Free delivery" : "Use it anywhere"}
                </span>
              </button>
            ))}
          </div>

          <h2 className="mt-8 font-display text-xl text-ink-900">
            2. Buyer and recipient
          </h2>
          <label className="mt-4 block text-sm">
            <span className="mb-1.5 block font-medium text-ink-700">Buyer name *</span>
            <input required value={buyerName} onChange={(e) => setBuyerName(e.target.value)} placeholder="Your name" className="w-full rounded-xl border border-cream-300 bg-surface px-4 py-3 text-sm text-ink-900 outline-none focus:border-brand-500" />
          </label>
          <a href={waLink(`Hello ${site.name}, please send me the payment instructions for a ${formatTsh(amount)} gift card.`)} target="_blank" rel="noopener noreferrer" className="btn-outline mt-4 w-full">
            Get payment instructions on WhatsApp
          </a>
          <label className="mt-4 block text-sm">
            <span className="mb-1.5 block font-medium text-ink-700">Buyer phone *</span>
            <input required type="tel" autoComplete="tel" value={buyerPhone} onChange={(e) => setBuyerPhone(e.target.value)} placeholder="+255..." className="w-full rounded-xl border border-cream-300 bg-surface px-4 py-3 text-sm text-ink-900 outline-none focus:border-brand-500" />
          </label>
          <label className="mt-4 block text-sm">
            <span className="mb-1.5 block font-medium text-ink-700">
              Recipient name
            </span>
            <input
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="e.g. Neema"
              className="w-full rounded-xl border border-cream-300 bg-surface px-4 py-3 text-sm text-ink-900 outline-none transition-colors focus:border-brand-500"
            />
          </label>
          <label className="mt-4 block text-sm">
            <span className="mb-1.5 block font-medium text-ink-700">Mobile money method *</span>
            <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="w-full rounded-xl border border-cream-300 bg-surface px-4 py-3 text-sm text-ink-900">
              <option value="mpesa">M-Pesa</option><option value="mixx">Mixx by Yas</option><option value="airtel">Airtel Money</option>
            </select>
          </label>
          <label className="mt-4 block text-sm">
            <span className="mb-1.5 block font-medium text-ink-700">Transaction reference after payment *</span>
            <input required value={paymentReference} onChange={(e) => setPaymentReference(e.target.value.trim())} placeholder="Enter reference after paying" className="w-full rounded-xl border border-cream-300 bg-surface px-4 py-3 text-sm text-ink-900 outline-none focus:border-brand-500" />
          </label>
          <label className="mt-4 block text-sm">
            <span className="mb-1.5 block font-medium text-ink-700">
              Gift message
            </span>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              placeholder="For example: Happy birthday!"
              className="w-full rounded-xl border border-cream-300 bg-surface px-4 py-3 text-sm text-ink-900 outline-none transition-colors focus:border-brand-500"
            />
          </label>

          {request ? (
            <div className="mt-6 rounded-2xl border border-warning-200 bg-warning-50 p-5 text-center">
              <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-success-100 text-success-600">
                <CheckIcon className="h-5 w-5" />
              </span>
              <p className="mt-3 text-sm text-ink-500">
                Payment submitted for {formatTsh(request.amountTsh)}. The code is not issued yet.
              </p>
              <p className="font-display mt-1 text-2xl tracking-wide text-ink-900">
                Request {request.id.slice(0, 8).toUpperCase()}
              </p>
              <p className="mt-2 text-xs text-ink-500">
                Keep your transaction reference. The store will verify payment and approve the card, then send the one-time code to you.
              </p>
            </div>
          ) : null}

          {error ? (
            <p className="mt-4 rounded-lg bg-danger-100 px-3 py-2 text-sm text-danger-600">
              {error}
            </p>
          ) : null}

          <button
            type="button"
            onClick={issue}
            disabled={sending}
            className="btn-primary mt-6 w-full disabled:opacity-60"
          >
            <ChatIcon className="h-4 w-4" />
            {sending
              ? "Creating gift card…"
              : request
                ? "Request another card"
                : `Request gift card — ${formatTsh(amount)}`}
          </button>

          {request ? (
            <a
              href={waLink(waText)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline mt-3 w-full"
            >
              Contact us about your payment
            </a>
          ) : null}
          <p className="mt-3 text-center text-xs text-ink-400">
            Payment is checked manually by the store. Your code is issued only after payment verification and admin approval, and expires one year after issue.
          </p>
        </div>

        {/* Details */}
        <div>
          <div className="relative overflow-hidden rounded-2xl border border-cream-300 bg-cream-200 p-8 text-center">
            <SparkleIcon className="mx-auto h-10 w-10 text-brand-600" />
            <p className="mt-4 font-display text-3xl text-ink-900">
              Niffer Gift Card
            </p>
            <p className="mt-1 text-sm text-ink-500">
              Value: {formatTsh(amount)}
            </p>
            <p className="mt-6 text-xs uppercase tracking-[0.3em] text-gold-700">
              Beauty, thoughtfully chosen
            </p>
          </div>

          <ol className="mt-8 space-y-6">
            {steps.map((step, i) => (
              <li key={step.title} className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-accent">
                  {i + 1}
                </span>
                <div>
                  <p className="font-medium text-ink-900">{step.title}</p>
                  <p className="mt-0.5 text-sm text-ink-500">
                    {step.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>

          <ul className="mt-8 space-y-2.5 rounded-2xl bg-cream-100 p-5 text-sm text-ink-500">
            {[
              "Valid on all Niffer Cosmetics products",
              "Cannot be exchanged for cash",
              "The code can be redeemed once up to its full value",
              "The card expires one year after issue",
            ].map((note) => (
              <li key={note} className="flex gap-2">
                <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-success-600" />
                {note}
              </li>
            ))}
          </ul>
        </div>
    </div>
  );
}
