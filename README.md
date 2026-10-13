# Niffer Cosmetics

Tovuti ya e-commerce ya Niffer Cosmetics — Next.js 16 (App Router, Turbopack), React 19, Tailwind 4, SQLite (`node:sqlite`). Kiolesura chote ni Kiswahili.

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
| `ADMIN_PASSWORD` | Nenosiri la admin. **Lazima liwekwe** kwa `/admin`. |
| `DATABASE_URL` | Njia ya DB ya SQLite. Chaguomsingi: `.data/niffer.db`. |
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

Nenda `/admin` kisha ingia kwa `ADMIN_PASSWORD`. Unaweza kusimamia bidhaa, oda, stoo, kadi za zawadi, ujumbe na arifa.

## muundo / teknolojia

- **Next.js 16.4** — App Router, `cacheComponents`, Partial Prerendering
- **SQLite** (`node:sqlite`) — DB ndio mwanzo wa ukweli (bidhaa, oda, stoo, kadi, wateja)
- **Tailwind CSS 4** — muundo wa kiolesura
- **Vitest** — majaribio ya kipengele
- Malipo: **AzamPay** (malipo ya mtandaoni) + COD
