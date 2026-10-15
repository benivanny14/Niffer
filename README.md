# Niffer Cosmetics

Tovuti ya e-commerce ya Niffer Cosmetics — Next.js 16 (App Router, Turbopack), React 19, Tailwind 4, PostgreSQL kupitia Neon. Kiolesura chote ni Kiswahili.

## Anza Hapa

```bash
npm install
npm run dev
```

Fungua [http://localhost:3000](http://localhost:3000).

## Mazingira (env)

Weka faili `.env.local` (ona `.env.example`):

| Kiableu | Maelezo |
| --- | --- |
| `ADMIN_PASSWORD` | Unique password for admin sign-in. Required in production. |
| `ADMIN_PANEL_PATH` | Private random URL segment for the admin dashboard (32+ URL-safe characters). |
| `DATABASE_URL` | Connection string ya Neon PostgreSQL (tumia pooled hostname kwa Vercel). |
| `RESEND_API_KEY` | (Hiari) Ujumbe wa barua pepe — akaunti & reset ya nywila. |
| `EMAIL_FROM` | (Hiari) Anwani ya mtumaji wa barua pepe. |

Bila `RESEND_API_KEY`, reset ya nywila hutumia fallback ya arifa ya admin.

## Amri

```bash
npm run dev      # seva ya maendeleo (Turbopack)
npm run build    # ujengaji wa production
npm run start    # endesha production build
npm run lint     # ESLint
npm test         # Vitest (unit tests)
```

## Admin

Admin uses a private URL segment set by `ADMIN_PANEL_PATH` and signs in with `ADMIN_PASSWORD`. Keep the URL private; the path is an extra layer against automated scans, while the password/session and protected API routes provide access control. Admin can manage products, orders, inventory, gift cards, messages and notifications.

## muundo / teknolojia

- **Next.js 16.4** — App Router, `cacheComponents`, Partial Prerendering
- **Neon PostgreSQL** (`@neondatabase/serverless`) — schema huundwa na kuwekwa seed wakati app inaanza kuunganisha DB.
- **Tailwind CSS 4** — muundo wa kiolesura
- **Vitest** — majaribio ya kipengele
- Malipo: **AzamPay** (malipo ya mtandaoni) + COD

## Neon na Vercel

1. Tengeneza PostgreSQL project kwenye Neon, nakili pooled connection string, na uiweke kama `DATABASE_URL` kwenye `.env.local` kwa local development.
2. Kwenye Vercel, ongeza `DATABASE_URL` kwenye Project Settings → Environment Variables kwa Production (na Preview ikiwa unaitumia).
3. Deploy. App huunda tables na indexes kwa `ensureDatabaseReady()` na huingiza bidhaa, hakiki na promo za awali mara ya kwanza.
4. Ukitaka kuhamisha data ya SQLite ya zamani, export/import yake ni hatua tofauti; schema initialization haileti oda, wateja au data nyingine zilizopo kutoka faili la SQLite.

## Cloudinary

Admin uploads use signed uploads through the server-side `cloudinary` SDK. Set `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` in `.env.local` and Vercel Environment Variables. The upload preset is not used. Product image delivery URLs are stored with `f_auto,q_auto`; the frontend renders those URLs directly.
