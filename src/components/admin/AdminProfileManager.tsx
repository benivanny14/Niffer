"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { apiGet, apiPost, apiPut, errorMessage } from "@/lib/api";
import { SparkleIcon } from "@/components/ui/icons";

const MAX_IMAGE_SIZE = 12 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

export function AdminProfileManager() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [image, setImage] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    apiGet<{ image: string }>("/api/store-profile")
      .then((data) => { if (active) setImage(data.image); })
      .catch(() => { if (active) setMessage("Could not load the current image."); });
    return () => { active = false; };
  }, []);

  async function upload(file?: File) {
    if (!file || busy) return;
    setMessage("");
    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      setMessage("Choose a JPG, PNG, WebP or AVIF image.");
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setMessage("Image must be 12MB or smaller.");
      return;
    }
    setBusy(true);
    try {
      const { upload } = await apiPost<{
        upload: {
          cloudName: string;
          apiKey: string;
          timestamp: number;
          signature: string;
          folder: string;
          publicId: string;
          overwrite: boolean;
        };
      }>("/api/store-profile");
      const form = new FormData();
      form.append("file", file);
      form.append("api_key", upload.apiKey);
      form.append("timestamp", String(upload.timestamp));
      form.append("signature", upload.signature);
      form.append("folder", upload.folder);
      form.append("public_id", upload.publicId);
      form.append("overwrite", String(upload.overwrite));

      const response = await fetch(`https://api.cloudinary.com/v1_1/${upload.cloudName}/image/upload`, {
        method: "POST",
        body: form,
      });
      const cloudinaryResult = await response.json() as { error?: { message?: string } };
      if (!response.ok) throw new Error(cloudinaryResult.error?.message || "Cloudinary could not upload the image.");

      const result = await apiPut<{ image: string }>("/api/store-profile");
      setImage(result.image);
      window.dispatchEvent(new CustomEvent("niffer:store-profile-updated", { detail: result.image }));
      setMessage("Your new image is now visible to all customers.");
    } catch (error) {
      setMessage(errorMessage(error));
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <section className="card mt-7 flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:p-6" aria-labelledby="store-profile-title">
      <div className="group relative mx-auto flex h-44 w-44 shrink-0 items-center justify-center transition-transform duration-300 ease-out hover:scale-[1.03] sm:mx-0 sm:h-56 sm:w-56">
        <span aria-hidden className="absolute -inset-2 rounded-full border border-dashed border-gold-500/60 transition-transform duration-500 ease-out group-hover:rotate-90" />
        <span className="relative flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-gold-500 via-brand-400 to-brand-800 p-[6px] shadow-[0_22px_44px_-22px_rgba(95,23,49,0.7)]">
          <span className="flex h-full w-full items-center justify-center rounded-full bg-surface p-[4px] dark:bg-[var(--surface-raised)]">
            <span className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-cream-100 text-accent">
              {image ? (
                <Image src={image} alt="Store profile image" fill unoptimized sizes="(max-width: 640px) 176px, 224px" className="object-cover" />
              ) : (
                <span className="flex flex-col items-center gap-1.5" aria-label="No store profile image set">
                  <SparkleIcon className="h-10 w-10 sm:h-12 sm:w-12" />
                  <span className="text-6xl font-display font-semibold sm:text-7xl">N</span>
                </span>
              )}
            </span>
          </span>
        </span>
        <span aria-hidden className="absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-full bg-gold-500 text-brand-900 shadow-md ring-4 ring-[var(--surface)] dark:ring-[var(--surface-raised)]">
          <SparkleIcon className="h-5 w-5" />
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="eyebrow">Store identity</p>
        <h2 id="store-profile-title" className="mt-1 font-display text-xl font-semibold text-ink-900">Store profile photo</h2>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-ink-500">This photo appears prominently in the top-left corner of the website header for all customers.</p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="sr-only" aria-label="Choose store profile photo" onChange={(event) => void upload(event.target.files?.[0])} />
          <button type="button" onClick={() => inputRef.current?.click()} disabled={busy} className="btn-primary min-w-36 disabled:opacity-60">
            {busy ? "Uploading image…" : image ? "Change photo" : "Upload photo"}
          </button>
          <span className="text-xs text-ink-400">JPG, PNG, WebP au AVIF · up to 12MB</span>
        </div>
        {message ? <p role="status" className="mt-3 text-sm text-ink-500">{message}</p> : null}
      </div>
    </section>
  );
}
