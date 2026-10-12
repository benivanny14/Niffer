import { site, waLink } from "@/lib/site";

const posts = [
  {
    id: "DeG59wfNE0C",
    title: "Most loved body lotions za lightening",
    detail: "Losheni za mwili zinazopendwa zaidi",
    price: "TSh 60,000 kila moja",
    note: "Thibitisha aina na upatikanaji kwa WhatsApp.",
    message:
      "Habari, naomba kuthibitisha aina na upatikanaji wa body lotion ya TSh 60,000 kutoka Instagram.",
  },
  {
    id: "DeGXQugN1LN",
    title: "NO 1 MPAKA KUMI NI MIXA BODY LOTION",
    detail: "Bei haijaelezwa kwenye chapisho.",
    message:
      "Habari, naomba bei na maelezo ya chapisho la Mixa Body Lotion kwenye Instagram.",
  },
  {
    id: "DeGVxphNoFu",
    title: "Bidhaa zinazopendwa zaidi zimejazwa tena",
    detail: "Majina na bei za bidhaa hazijaelezwa kwenye chapisho.",
    note: "Ulizia majina na upatikanaji kwa WhatsApp.",
    message:
      "Habari, naomba majina, bei na upatikanaji wa bidhaa kwenye chapisho la Instagram kuhusu bidhaa zilizojazwa tena.",
  },
] as const;

export function InstagramShowcase() {
  return (
    <section
      id="instagram"
      className="scroll-mt-24 border-y border-cream-300 bg-cream-100 py-16 lg:py-24"
      aria-labelledby="instagram-heading"
    >
      <div className="container-x">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="eyebrow">Kutoka kwenye akaunti yetu</p>
            <h2 id="instagram-heading" className="heading-display mt-2">
              Bidhaa halisi kutoka Instagram
            </h2>
            <p className="mt-4 max-w-xl leading-relaxed text-ink-500">
              Tazama machapisho halisi ya Niffer Cosmetics. Kwa bei au
              upatikanaji ambao haujaelezwa, tuulize WhatsApp.
            </p>
          </div>
          <a
            href={site.socials.instagram}
            target="_blank"
            rel="noreferrer"
            className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-accent underline decoration-brand-300 underline-offset-4 transition-colors hover:text-brand-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-600"
          >
            Fuatilia Niffer kwenye Instagram
            <span aria-hidden="true">↗</span>
          </a>
        </div>

        <ul className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {posts.map((post) => {
            const postUrl = `https://www.instagram.com/niffer_cosmetics1/reel/${post.id}/`;

            return (
              <li key={post.id}>
                <article className="card flex h-full flex-col overflow-hidden">
                  <div className="flex items-center justify-between border-b border-cream-300 px-5 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-500">
                      Instagram · Reel
                    </p>
                    <span
                      aria-hidden="true"
                      className="h-2 w-2 rounded-full bg-brand-500"
                    />
                  </div>

                  <div className="overflow-hidden bg-white">
                    <iframe
                      title={`Chapisho la Instagram: ${post.title}`}
                      src={`${postUrl}embed/`}
                      loading="lazy"
                      allowFullScreen
                      referrerPolicy="strict-origin-when-cross-origin"
                      className="block h-[580px] w-full max-w-full border-0 bg-white sm:h-[620px]"
                    />
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="font-display text-lg leading-snug text-ink-900">
                      {post.title}
                    </h3>
                    <p className="mt-2 text-sm text-ink-500">{post.detail}</p>
                    <p
                      className={`mt-4 font-semibold ${
                        post.price
                          ? "text-lg text-accent"
                          : "text-sm text-ink-700"
                      }`}
                    >
                      {post.price ?? "Ulizia bei WhatsApp"}
                    </p>
                    {post.note ? (
                      <p className="mt-1 text-xs leading-relaxed text-ink-500">
                        {post.note}
                      </p>
                    ) : null}

                    <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 pt-5 text-sm">
                      <a
                        href={waLink(post.message)}
                        target="_blank"
                        rel="noreferrer"
                        className="font-semibold text-accent underline decoration-brand-300 underline-offset-4 transition-colors hover:text-brand-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-600"
                      >
                        Uliza WhatsApp
                      </a>
                      <a
                        href={postUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-ink-500 underline decoration-cream-300 underline-offset-4 transition-colors hover:text-ink-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-600"
                      >
                        Fungua chapisho
                      </a>
                    </div>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>

        <p className="mt-6 text-xs leading-relaxed text-ink-400">
          Machapisho haya yanaonyesha machache tu; si kumbukumbu kamili ya
          akaunti.
        </p>
      </div>
    </section>
  );
}
