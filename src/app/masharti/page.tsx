import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Terms for using the Niffer Cosmetics website and shopping with us.",
};

const sections = [
  {
    h: "Acceptance of terms",
    p: "By using this website, you agree to these terms. If you do not agree, please do not use our services.",
  },
  {
    h: "Prices and products",
    p: "We do our best to keep prices and product details accurate. If we find an error, we may contact you before confirming your order.",
  },
  {
    h: "Orders and payment",
    p: "An order is confirmed once you receive confirmation from us. We may decline an order if an item is out of stock.",
  },
  {
    h: "Delivery",
    p: "Delivery times are estimates. We are not responsible for delays caused by events beyond our control, such as weather or transport disruptions.",
  },
  {
    h: "Returns",
    p: "Returns are handled under our returns policy. See the Returns page for full details.",
  },
  {
    h: "Contact",
    p: "For questions about these terms, contact us by WhatsApp or email.",
  },
];

export default function TermsPage() {
  return (
    <div className="container-x max-w-3xl py-12 lg:py-16">
      <p className="eyebrow">Legal</p>
      <h1 className="heading-display mt-2">Terms of Use</h1>
      <p className="mt-3 text-ink-500">
        These terms apply to your use of the Niffer Cosmetics website and services.
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
