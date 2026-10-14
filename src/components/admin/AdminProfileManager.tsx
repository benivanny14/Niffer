"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { apiForm, apiGet, errorMessage } from "@/lib/api";

export function AdminProfileManager() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [image, setImage] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    apiGet<{ image: string }>("/api/store-profile")
      .then((data) => { if (active) setImage(data.image); })
      .catch(() => { if (active) setMessage("Picha ya sasa haikuweza kupakiwa."); });
    return () => { active = false; };
  }, []);

  async function upload(file?: File) {
    if (!file || busy) return;
    setMessage("");
    setBusy(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const result = await apiForm<{ image: string }>("/api/store-profile", form);
      setImage(result.image);
      window.dispatchEvent(new CustomEvent("niffer:store-profile-updated", { detail: result.image }));
      setMessage("Picha mpya sasa inaonekana kwa wateja wote.");
    } catch (error) {
      setMessage(errorMessage(error));
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <section className="card mt-7 flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:p-6" aria-labelledby="store-profile-title">
      <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl border border-brand-300/50 bg-gradient-to-br from-brand-100 via-surface-raised to-gold-100 p-1 shadow-lg shadow-black/20 sm:h-32 sm:w-32">
        {image ? (
          <Image src={image} alt="Picha ya profile ya duka" fill unoptimized sizes="128px" className="rounded-[0.8rem] object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded-[0.8rem] bg-surface text-4xl font-display font-semibold text-accent" aria-label="Hakuna picha ya profile iliyowekwa">
            N
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="eyebrow">Utambulisho wa duka</p>
        <h2 id="store-profile-title" className="mt-1 font-display text-xl font-semibold text-ink-900">Picha ya profile inayoonekana kwa wote</h2>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-ink-500">Picha hii itawekwa kubwa upande wa juu kushoto kwenye header ya tovuti, na itaonekana kwa wateja wote.</p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="sr-only" aria-label="Chagua picha ya profile ya duka" onChange={(event) => void upload(event.target.files?.[0])} />
          <button type="button" onClick={() => inputRef.current?.click()} disabled={busy} className="btn-primary min-w-36 disabled:opacity-60">
            {busy ? "Inapakia picha…" : image ? "Badili picha" : "Weka picha"}
          </button>
          <span className="text-xs text-ink-400">JPG, PNG, WebP au AVIF · hadi 5MB</span>
        </div>
        {message ? <p role="status" className="mt-3 text-sm text-ink-500">{message}</p> : null}
      </div>
    </section>
  );
}
