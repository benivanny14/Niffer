"use client";

import { useState } from "react";
import { waLink, site } from "@/lib/site";
import { MailIcon, CheckIcon } from "@/components/ui/icons";

/** Fomu ya jarida — hutuma kwa WhatsApp (hakuna backend bado). */
export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
    setDone(true);
    window.open(
      waLink(`Habari ${site.name}, nijiunge na jarida langu: ${email}`),
      "_blank",
      "noopener",
    );
  }

  if (done) {
    return (
      <div className="card flex items-center gap-3 p-6">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-success-100 text-success-600">
          <CheckIcon className="h-5 w-5" />
        </span>
        <p className="text-sm text-ink-700">
          Asante! Umejiunga kwa{" "}
          <span className="font-semibold">{email}</span>. Thibitisha kwa
          WhatsApp.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card p-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex flex-1 items-center gap-2 rounded-full border border-cream-300 bg-white px-4">
          <MailIcon className="h-4.5 w-4.5 shrink-0 text-ink-400" />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="barua.pepe@mfano.com"
            aria-label="Anwani ya barua pepe"
            className="w-full bg-transparent py-3 text-sm text-ink-900 outline-none placeholder:text-ink-400"
          />
        </div>
        <button type="submit" className="btn-primary shrink-0">
          Jiunge Sasa
        </button>
      </div>
      <p className="mt-2 px-2 text-xs text-ink-400">
        Tutatuma ofa muhimu tu. Unaweza kuacha wakati wowote.
      </p>
    </form>
  );
}
