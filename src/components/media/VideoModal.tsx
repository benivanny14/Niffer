"use client";

import { useEffect, useRef } from "react";
import type { BeautyVideo } from "@/lib/data/catalog";
import { ProductImage } from "@/components/media/ProductImage";
import { CloseIcon, PlayIcon } from "@/components/ui/icons";

type Props = {
  video: BeautyVideo | null;
  onClose: () => void;
};

/** Modal ya video — YouTube embed (providerId) au mp4 moja kwa moja. */
export function VideoModal({ video, onClose }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!video) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [video, onClose]);

  if (!video) return null;

  const embedUrl = video.providerId
    ? `https://www.youtube-nocookie.com/embed/${video.providerId}?autoplay=1&rel=0`
    : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={video.title}
    >
      <div
        className="absolute inset-0 bg-ink-900/70 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative w-full max-w-3xl animate-fade-up">
        <div className="flex items-start justify-between gap-4 pb-3">
          <div>
            <h3 className="font-display text-xl text-white">{video.title}</h3>
            <p className="mt-0.5 text-sm text-white/70">{video.description}</p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Funga video"
            className="shrink-0 rounded-full p-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
          >
            <CloseIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="overflow-hidden rounded-2xl bg-black shadow-2xl">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              title={video.title}
              className="aspect-video w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : video.mp4Url ? (
            <video
              src={video.mp4Url}
              controls
              autoPlay
              playsInline
              className="aspect-video w-full bg-black"
            />
          ) : (
            <div className="relative aspect-video w-full">
              <ProductImage
                src={video.thumbnail}
                alt={video.title}
                className="absolute inset-0 h-full w-full opacity-60"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 text-brand-700">
                  <PlayIcon className="ml-1 h-7 w-7" />
                </span>
                <p className="max-w-sm px-4 text-sm font-medium text-white">
                  Video rasmi inakuja hivi karibuni. Weka YouTube ID au mp4
                  kwenye catalog ili icheze hapa.
                </p>
              </div>
            </div>
          )}
        </div>

        <p className="pt-3 text-xs text-white/60">Muda: {video.duration}</p>
      </div>
    </div>
  );
}
