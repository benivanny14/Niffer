import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description:
    "Answers to common questions about shopping, payment, delivery and returns at Niffer Cosmetics.",
};

const faqs = [
  {
    q: "Where can I find product details?",
    a: "Open a product page to see its photos, price and description. If you have more questions, contact us before ordering.",
  },
  {
    q: "How can I pay?",
    a: "We accept M-Pesa, Mixx by Yas and Airtel Money. You can also pay on delivery. Choose your preferred method at checkout.",
  },
  {
    q: "Where do you deliver, and how much does it cost?",
    a: "Dar es Salaam delivery usually takes 1–2 days and is free on orders over TSh 50,000; otherwise, it costs TSh 3,000. Delivery to other regions usually takes 2–5 days.",
  },
  {
    q: "Can I return a product?",
    a: "Yes. Returns are accepted within 7 days if the product is unused and in its original condition. See our Returns page for details.",
  },
  {
    q: "How can I track my order?",
    a: "After placing an order, you’ll receive an order number (for example, NCF-8F3K). Enter it on the Track Order page to see the latest status.",
  },
  {
    q: "How can I contact you?",
    a: "Call, message us on WhatsApp or email us using the details on our Contact page. Our address and opening hours are also listed in the footer.",
  },
];

export default function FaqPage() {
  return (
    <div className="container-x max-w-3xl py-12 lg:py-16">
      <p className="eyebrow">Help</p>
      <h1 className="heading-display mt-2">Frequently asked questions</h1>
      <p className="mt-3 text-ink-500">
        Find answers to common questions here. If you need more help, our team is happy to assist.
      </p>

      <div className="mt-10 space-y-3">
        {faqs.map((item) => (
          <details key={item.q} className="card group p-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-ink-900">
              {item.q}
              <span className="text-accent transition-transform group-open:rotate-45">+</span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-ink-500">{item.a}</p>
          </details>
        ))}
      </div>

      <div className="card mt-10 p-6 text-center">
        <p className="font-display text-lg text-ink-900">Still have a question?</p>
        <p className="mt-1 text-sm text-ink-500">
          Call us, message us on WhatsApp or visit our store. We’re here to help.
        </p>
        <Link href="/wasiliana" className="btn-primary mt-5">Contact us</Link>
      </div>
    </div>
  );
}
