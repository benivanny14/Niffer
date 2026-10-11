import type { Metadata } from "next";
import { GiftCardPanel } from "@/components/ui/GiftCardPanel";

export const metadata: Metadata = {
  title: "Kadi za Zawadi",
  description:
    "Kadi ya zawadi ya Niffer Cosmetics — zawadi kamili kwa mpendwa wako. Thamani kutoka TSh 10,000.",
};

export default function GiftCardsPage() {
  return (
    <div className="container-x py-12 lg:py-16">
      <p className="eyebrow">Zawadi</p>
      <h1 className="heading-display mt-2">Kadi za zawadi za Niffer</h1>
      <p className="mt-3 max-w-2xl text-ink-500">
        Ukipenda kumfurahisha mtu lakini hujui bidhaa gani apendayo — mpe kadi
        ya zawadi. Atachagua mwenyewe bidhaa anazozipenda.
      </p>
      <div className="mt-10">
        <GiftCardPanel />
      </div>
    </div>
  );
}
