import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Niffer Cosmetics uses and protects your information.",
};

const sections = [
  {
    h: "Information we collect",
    p: "We collect your name, phone number, address, and email when you place an order or subscribe. We also store your order history on your device.",
  },
  {
    h: "How we use your information",
    p: "We use your information to deliver orders, share order updates, and send offers you have opted into. We do not sell your information.",
  },
  {
    h: "Payments",
    p: "Payments are handled through M-Pesa, Mixx by Yas, Airtel Money, or payment on delivery. We do not store bank card details on our servers.",
  },
  {
    h: "Your rights",
    p: "You can request access to, correction of, or deletion of your information at any time. Contact us by WhatsApp or email.",
  },
  {
    h: "Cookies and local storage",
    p: "Our site uses local storage to save your cart and wishlist on your device. We do not use tracking cookies.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="container-x max-w-3xl py-12 lg:py-16">
      <p className="eyebrow">Legal</p>
      <h1 className="heading-display mt-2">Privacy Policy</h1>
      <p className="mt-3 text-ink-500">
        We respect your privacy. This page explains how we collect and protect your information.
      </p>
      <div className="mt-10 space-y-8">
        {sections.map((s) => (
          <section key={s.h}>
            <h2 className="font-display text-xl text-ink-900">{s.h}</h2>
            <p className="mt-2 leading-relaxed text-ink-500">{s.p}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
