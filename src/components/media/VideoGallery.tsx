"use client";

import { useState } from "react";
import Link from "next/link";
import type { BeautyVideo } from "@/lib/data/catalog";
import { ProductImage } from "@/components/media/ProductImage";
import { VideoModal } from "@/components/media/VideoModal";
import { Portal } from "@/components/ui/Portal";
import { PlayIcon } from "@/components/ui/icons";

/**
 * Grid ya video + modal ya kucheza.
 *
 * Kila kadi ina kitufe cha "Cheza" kinachofungua VideoModal. Ikiwa video
 * ina `providerId` (YouTube/Vimeo) huweka embed; vinginevyo huonyesha
 * thumbnail na ujumbe wa "video inakuja hivi karibuni" — hakuna kitufe
 * kilichokufa.
 */
export function VideoGallery({ videos }: { videos: BeautyVideo[] }) {
  const [active, setActive] = useState<BeautyVideo | null>(null);

  return (
    <>
      <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {videos.map((video) => (
          <li key={video.id}>
            <article className="card group flex h-full flex-col overflow-hidden">
              <div className="relative aspect-video bg-cream-200">
                <ProductImage
                  src={video.thumbnail}
                  alt={video.title}
                  className="absolute inset-0 h-full w-full"
                />
                <button
                  type="button"
                  onClick={() => setActive(video)}
                  className="absolute inset-0 flex items-center justify-center"
                  aria-label={`Cheza video: ${video.title}`}
                >
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-surface/90 text-accent shadow-lg transition-transform group-hover:scale-110">
                    <PlayIcon className="ml-0.5 h-6 w-6" />
                  </span>
                </button>
                <span className="badge absolute bottom-3 right-3 bg-black/80 text-white">
                  {video.duration}
                </span>
              </div>
              <div className="flex flex-1 flex-col gap-2 p-5">
                <h3 className="font-display text-lg leading-snug text-ink-900">
                  {video.title}
                </h3>
                <p className="text-sm text-ink-500">{video.description}</p>
                {video.relatedProductSlug ? (
                  <Link
                    href={`/bidhaa/${video.relatedProductSlug}`}
                    className="mt-auto pt-3 text-sm font-semibold text-accent hover:text-accent"
                  >
                    Bidhaa zinazohusiana →
                  </Link>
                ) : null}
              </div>
            </article>
          </li>
        ))}
      </ul>

      <Portal>
        <VideoModal video={active} onClose={() => setActive(null)} />
      </Portal>
    </>
  );
}
