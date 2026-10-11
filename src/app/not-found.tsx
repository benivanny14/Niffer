import Link from "next/link";
import { SearchIcon, SparkleIcon } from "@/components/ui/icons";

export default function NotFound() {
  return (
    <div className="container-x flex flex-col items-center py-24 text-center">
      <SparkleIcon className="h-14 w-14 text-brand-300" />
      <p className="eyebrow mt-6">Ukurasa haupatikani</p>
      <h1 className="heading-display mt-2">Tumepotea njia kidogo</h1>
      <p className="mt-4 max-w-md text-ink-500">
        Ukurasa unaoutafuta haupo au umehamishwa. Lakini bidhaa zetu bado
        zinakusubiri.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn-primary">
          Rudi Mwanzo
        </Link>
        <Link href="/bidhaa" className="btn-outline">
          Vinjari Bidhaa
        </Link>
        <Link href="/tafuta" className="btn-outline">
          <SearchIcon className="h-4 w-4" />
          Tafuta
        </Link>
      </div>
    </div>
  );
}
