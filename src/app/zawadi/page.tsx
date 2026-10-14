import type { Metadata } from "next";
import { GiftCardPanel } from "@/components/ui/GiftCardPanel";

export const metadata: Metadata = {
  title: "Gift Cards",
  description:
    "Niffer Cosmetics gift cards make a thoughtful present. Values start at TSh 10,000.",
};

export default function GiftCardsPage() {
  return (
    <div className="container-x py-12 lg:py-16">
      <p className="eyebrow">Gifts</p>
      <h1 className="heading-display mt-2">Niffer gift cards</h1>
      <p className="mt-3 max-w-2xl text-ink-500">Want to surprise someone but not sure what they would like? Give them a gift card and let them choose their favourites.</p>
      <div className="mt-10">
        <GiftCardPanel />
      </div>
    </div>
  );
}
