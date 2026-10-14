import Link from "next/link";
import { SearchIcon, SparkleIcon } from "@/components/ui/icons";

export default function NotFound() {
  return (
    <div className="container-x flex flex-col items-center py-24 text-center">
      <SparkleIcon className="h-14 w-14 text-brand-300" />
      <p className="eyebrow mt-6">Page not found</p>
      <h1 className="heading-display mt-2">Tumepotea njia kidogo</h1>
      <p className="mt-4 max-w-md text-ink-500">
        The page you are looking for is missing or has moved. You can still browse
        zinakusubiri.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn-primary">
          Back to home
        </Link>
        <Link href="/bidhaa" className="btn-outline">
          Browse products
        </Link>
        <Link href="/tafuta" className="btn-outline">
          <SearchIcon className="h-4 w-4" />
          Search
        </Link>
      </div>
    </div>
  );
}
