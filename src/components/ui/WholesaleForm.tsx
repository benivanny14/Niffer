"use client";

import { useState } from "react";
import { site, waLink, tanzaniaRegions } from "@/lib/site";
import { ChatIcon, CheckIcon } from "@/components/ui/icons";

const field =
  "w-full rounded-xl border border-cream-300 bg-white px-4 py-3 text-sm text-ink-900 outline-none transition-colors focus:border-brand-500";

/** Fomu ya ombi la jumla — hutuma kwa WhatsApp (hakuna backend bado). */
export function WholesaleForm() {
  const [business, setBusiness] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [region, setRegion] = useState<string>(tanzaniaRegions[0]);
  const [qty, setQty] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[0-9+\s]{9,15}$/.test(phone.trim())) {
      setError("Weka namba sahihi ya simu (mfano 0754 000 000).");
      return;
    }
    setError("");
    const text =
      `Habari ${site.name}, naomba bei ya jumla.\n` +
      `Biashara: ${business}\nMtu: ${name}\nSimu: ${phone}\n` +
      `Mkoa: ${region}\nWingi unaohitaji: ${qty || "—"}` +
      (note ? `\nMaelezo: ${note}` : "");
    window.open(waLink(text), "_blank", "noopener");
    setDone(true);
  }

  if (done) {
    return (
      <div className="card flex items-center gap-3 p-6">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-success-100 text-success-600">
          <CheckIcon className="h-5 w-5" />
        </span>
        <p className="text-sm text-ink-700">
          Asante! Ombi lako limetumwa kwa WhatsApp. Tutakupigia simu ndani ya
          saa 24.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card space-y-4 p-6">
      <label className="block text-sm">
        <span className="mb-1.5 block font-medium text-ink-700">
          Jina la biashara *
        </span>
        <input
          required
          value={business}
          onChange={(e) => setBusiness(e.target.value)}
          className={field}
          placeholder="Mfano: Saluni ya Urembo"
        />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-ink-700">
            Jina lako *
          </span>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={field}
            placeholder="Jina lako"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-ink-700">
            Namba ya simu *
          </span>
          <input
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={field}
            placeholder="0754 000 000"
            inputMode="tel"
          />
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-ink-700">Mkoa</span>
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className={field}
          >
            {tanzaniaRegions.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-ink-700">
            Wingi unaohitaji
          </span>
          <input
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            className={field}
            placeholder="Mfano: bidhaa 30"
          />
        </label>
      </div>
      <label className="block text-sm">
        <span className="mb-1.5 block font-medium text-ink-700">
          Maelezo ya ziada
        </span>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          className={field}
          placeholder="Bidhaa unazovutiwa, muda unaotarajia…"
        />
      </label>
      {error ? (
        <p className="rounded-lg bg-danger-100 px-3 py-2 text-sm text-danger-600">
          {error}
        </p>
      ) : null}
      <button type="submit" className="btn-primary w-full">
        <ChatIcon className="h-4 w-4" />
        Tuma Ombi kwa WhatsApp
      </button>
    </form>
  );
}
