"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { site, waLink } from "@/lib/site";
import {
  ChatIcon,
  ClockIcon,
  MapPinIcon,
  PhoneIcon,
} from "@/components/ui/icons";

export type Branch = {
  name: string;
  city: string;
  address: string;
  hours: string;
  phone: string;
  phoneTel: string;
  flagship: boolean;
  services: string[];
};

const ALL = "zote";

/**
 * Uchujaji wa eneo kama jiji.com: chip za mji zinarekebishwa kwenye URL
 * (`?eneo=Dar+es+Salaam`) ili viungo viweze kushirikiwa na kurudi nyuma kufanya kazi.
 */
export function BranchExplorer({ branches }: { branches: Branch[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const cities = [...new Set(branches.map((b) => b.city))];

  const requested = params.get("eneo") ?? "";
  const active = cities.includes(requested) ? requested : ALL;
  const shown =
    active === ALL ? branches : branches.filter((b) => b.city === active);

  function select(city: string) {
    const next = new URLSearchParams(params.toString());
    if (city === ALL) next.delete("eneo");
    else next.set("eneo", city);
    const qs = next.toString();
    router.replace(qs ? `/matawi?${qs}` : "/matawi", { scroll: false });
  }

  return (
    <div>
      {/* Chip za mji */}
      <div
        role="group"
        aria-label="Chuja kwa mji"
        className="flex flex-wrap gap-2"
      >
        {[ALL, ...cities].map((city) => {
          const isActive = city === active;
          const count =
            city === ALL
              ? branches.length
              : branches.filter((b) => b.city === city).length;
          return (
            <button
              key={city}
              type="button"
              onClick={() => select(city)}
              aria-pressed={isActive}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "border-brand-700 bg-brand-700 text-white"
                  : "border-cream-300 bg-surface text-ink-700 hover:border-brand-300 hover:text-accent"
              }`}
            >
              {city === ALL ? "Mji wote" : city}
              <span
                className={`ml-1.5 text-xs ${isActive ? "text-white/70" : "text-ink-400"}`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {shown.length === 0 ? (
        <p className="card mt-6 p-6 text-sm text-ink-500">
          Hakuna tawi kwenye mji huu bado. Jaribu mji mwingine au wasiliana nasi
          kwa WhatsApp.
        </p>
      ) : (
        <ul className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {shown.map((branch) => (
            <li
              key={branch.name}
              className={`card flex flex-col p-6 ${
                branch.flagship ? "border-brand-300" : ""
              }`}
            >
              {branch.flagship ? (
                <span className="badge mb-3 self-start bg-gold-100 text-gold-700">
                  Tawi kuu
                </span>
              ) : null}
              <h2 className="font-display text-xl text-ink-900">
                {branch.name}
              </h2>
              <ul className="mt-4 flex-1 space-y-3 text-sm text-ink-500">
                <li className="flex items-start gap-2.5">
                  <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                  {branch.address}
                </li>
                <li className="flex items-start gap-2.5">
                  <ClockIcon className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                  {branch.hours}
                </li>
                <li className="flex items-start gap-2.5">
                  <PhoneIcon className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                  <a
                    href={`tel:${branch.phoneTel}`}
                    className="transition-colors hover:text-accent"
                  >
                    {branch.phone}
                  </a>
                </li>
              </ul>
              <ul className="mt-4 flex flex-wrap gap-1.5">
                {branch.services.map((service) => (
                  <li
                    key={service}
                    className="rounded-full bg-cream-100 px-2.5 py-1 text-[11px] font-medium text-ink-500"
                  >
                    {service}
                  </li>
                ))}
              </ul>
              <a
                href={waLink(
                  `Habari ${site.name}, nina swali kuhusu tawi la ${branch.city}.`,
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline mt-5 w-full"
              >
                <ChatIcon className="h-4 w-4" />
                WhatsApp tawi la {branch.city}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
