import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { listProducts } from "@/lib/server/catalog";
import { RoutineQuiz } from "@/components/tools/RoutineQuiz";

export const metadata: Metadata = {
  title: "Skincare Routine Quiz",
  description:
    "Answer a few questions to get skincare product recommendations tailored to you — for your daily routine.",
};

export default async function RoutineQuizPage() {
  // Bidhaa za DB (admin anaweza kubadilisha bei/kategoria) — zinapangwa na quiz.
  await connection();
  const products = await listProducts();

  return (
    <div className="container-x max-w-3xl py-12 lg:py-16">
      <p className="eyebrow">Free tool</p>
      <h1 className="heading-display mt-2">Skincare routine quiz</h1>
      <p className="mt-3 max-w-2xl text-ink-500">
        Answer four quick questions to find three products that suit your skin type,
        goals and budget.
      </p>

      <p className="mt-4 text-sm text-ink-500">
        Looking for a fragrance? Try our{" "}
        <Link href="/harufu" className="font-semibold text-accent hover:underline">
          Fragrance finder →
        </Link>
      </p>

      <div className="mt-8">
        <RoutineQuiz products={products} />
      </div>
    </div>
  );
}
