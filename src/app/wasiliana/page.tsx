import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";
import { ContactForm } from "@/components/ui/ContactForm";
import {
  ChatIcon,
  ClockIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
} from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "Wasiliana Nasi",
  description:
    "Wasiliana na Niffer Cosmetics kupitia simu, WhatsApp, barua pepe au tembelea duka letu Dar es Salaam.",
};

const channels = [
  {
    icon: PhoneIcon,
    label: "Simu",
    value: site.phoneDisplay,
    href: `tel:${site.phoneTel}`,
  },
  {
    icon: ChatIcon,
    label: "WhatsApp",
    value: "Oda za haraka",
    href: `https://wa.me/${site.whatsapp}`,
  },
  {
    icon: MailIcon,
    label: "Barua pepe",
    value: site.email,
    href: `mailto:${site.email}`,
  },
  {
    icon: MapPinIcon,
    label: "Ofisi",
    value: site.address,
    href: undefined,
  },
];

export default function ContactPage() {
  return (
    <div className="container-x py-12 lg:py-16">
      <p className="eyebrow">Huduma kwa wateja</p>
      <h1 className="heading-display mt-2">Wasiliana Nasi</h1>
      <p className="mt-3 max-w-2xl text-ink-500">
        Uko na swali kuhusu bidhaa, oda, au unahitaji ushauri wa urembo? Tupo
        hapa kukusaidia.
      </p>

      <div className="mt-10 grid gap-10 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <ContactForm />
        </div>

        <aside className="space-y-4 lg:col-span-2">
          {channels.map(({ icon: Icon, label, value, href }) => {
            const inner = (
              <>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100 text-accent">
                  <Icon className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-xs uppercase tracking-wide text-ink-400">
                    {label}
                  </span>
                  <span className="block font-medium text-ink-900">
                    {value}
                  </span>
                </span>
              </>
            );
            return href ? (
              <a
                key={label}
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel={
                  href.startsWith("http") ? "noopener noreferrer" : undefined
                }
                className="card flex items-center gap-3 p-4 transition-shadow"
              >
                {inner}
              </a>
            ) : (
              <div key={label} className="card flex items-center gap-3 p-4">
                {inner}
              </div>
            );
          })}

          <div className="card flex items-center gap-3 p-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100 text-accent">
              <ClockIcon className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-xs uppercase tracking-wide text-ink-400">
                Siku za kazi
              </span>
              <span className="block font-medium text-ink-900">
                {site.hours}
              </span>
            </span>
          </div>

          <Link href="/maswali" className="btn-outline w-full">
            Angalia Maswali Yanayoulizwa
          </Link>
        </aside>
      </div>
    </div>
  );
}
