import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { listProducts } from "@/lib/server/catalog";
import { RoutineQuiz } from "@/components/tools/RoutineQuiz";

export const metadata: Metadata = {
  title: "Swali la Utunzaji wa Ngozi",
  description:
    "Jibu maswali mafupi na upate mapendekezo ya bidhaa za skincare zinazokufaa — rutini yako ya kila siku kwa ngozi yako.",
};

export default async function RoutineQuizPage() {
  // Bidhaa za DB (admin anaweza kubadilisha bei/kategoria) — zinapangwa na quiz.
  await connection();
  const products = listProducts();

  return (
    <div className="container-x max-w-3xl py-12 lg:py-16">
      <p className="eyebrow">Zana ya bure</p>
      <h1 className="heading-display mt-2">Swali la utunzaji wa ngozi</h1>
      <p className="mt-3 max-w-2xl text-ink-500">
        Maswali manne mafupi. Tutakupendekeza bidhaa tatu zinazolingana na aina
        ya ngozi yako, lengo lako na bajeti yako.
      </p>

      <p className="mt-4 text-sm text-ink-500">
        Unatafuta harufu? Pia jaribu{" "}
        <Link href="/harufu" className="font-semibold text-accent hover:underline">
          Tafuta Harufu →
        </Link>
      </p>

      <div className="mt-8">
        <RoutineQuiz products={products} />
      </div>
    </div>
  );
}
