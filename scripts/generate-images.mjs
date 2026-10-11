/**
 * Media module (mock): generates branded SVG illustrations into public/images.
 * Baada ya kupata picha halisi (photoshoot/CDN), futa script hii na badilisha
 * `image` paths kwenye src/lib/data/catalog.ts.
 *
 * Run: node scripts/generate-images.mjs
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = join(process.cwd(), "public", "images");
const dirs = ["products", "videos"];
for (const dir of dirs) mkdirSync(join(root, dir), { recursive: true });

/* ---------- shared helpers ---------- */

const sparkles = (color = "#c9a86a", opacity = 0.6) => `
  <g fill="${color}" opacity="${opacity}">
    <path d="M64 60l3 9 9 3-9 3-3 9-3-9-9-3 9-3z"/>
    <path d="M338 108l2.2 6.6 6.6 2.2-6.6 2.2-2.2 6.6-2.2-6.6-6.6-2.2 6.6-2.2z"/>
    <path d="M312 424l1.8 5.4 5.4 1.8-5.4 1.8-1.8 5.4-1.8-5.4-5.4-1.8 5.4-1.8z"/>
  </g>`;

const svg = (inner, w = 400, h = 500) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" fill="none" role="img">${inner}</svg>\n`;

const bgGradient = (id, from, to) => `
  <defs>
    <linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${from}"/>
      <stop offset="1" stop-color="${to}"/>
    </linearGradient>
  </defs>
  <rect width="400" height="500" fill="url(#${id})"/>`;

const label = (text, y = 322, fill = "#5f1731") =>
  `<text x="200" y="${y}" text-anchor="middle" font-family="Georgia, serif" font-size="17" letter-spacing="1.5" fill="${fill}">${text}</text>
   <line x1="140" y1="${y + 10}" x2="260" y2="${y + 10}" stroke="${fill}" stroke-width="1" opacity="0.35"/>`;

/* soft ground shadow shared by all packshots */
const ground = (cy = 452) =>
  `<ellipse cx="200" cy="${cy}" rx="120" ry="14" fill="#4a1225" opacity="0.08"/>`;

const files = new Map();
const put = (path, content) => files.set(join(root, path), content);

/* ---------- products ---------- */

put(
  "products/radiance-vitamin-c-serum.svg",
  svg(
    `${bgGradient("bg", "#f8e6eb", "#f6eedd")}
    ${ground(448)}
    <rect x="176" y="96" width="48" height="26" rx="6" fill="url(#glass)"/>
    <rect x="182" y="122" width="36" height="18" rx="4" fill="#8c7d6e"/>
    <rect x="150" y="140" width="100" height="290" rx="26" fill="url(#glass)"/>
    <rect x="150" y="140" width="100" height="290" rx="26" fill="none" stroke="#8f713c" stroke-width="1.5"/>
    <path d="M168 168c0-12 8-20 14-24v38c-8-2-14-8-14-14z" fill="#ffffff" opacity="0.35"/>
    <rect x="166" y="268" width="68" height="86" rx="10" fill="#fdfbf8"/>
    ${label("RADIANCE C", 306)}
    <text x="200" y="332" text-anchor="middle" font-family="Georgia, serif" font-size="11" letter-spacing="2" fill="#b08d4f">20% SERUM</text>
    ${sparkles()}
    <defs>
      <linearGradient id="glass" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#e2cba0"/>
        <stop offset="0.55" stop-color="#c9a86a"/>
        <stop offset="1" stop-color="#b08d4f"/>
      </linearGradient>
    </defs>`,
  ),
);

put(
  "products/velvet-matte-lipstick-set.svg",
  svg(
    `${bgGradient("bg", "#fdf4f6", "#f5eee5")}
    ${ground(450)}
    <g>
      <rect x="132" y="150" width="52" height="280" rx="10" fill="url(#tube1)"/>
      <rect x="132" y="150" width="52" height="52" rx="10" fill="#c9a86a"/>
      <path d="M144 150c0-24 4-44 14-52 10 8 14 28 14 52h-28z" fill="#7a1f3f"/>
    </g>
    <g>
      <rect x="216" y="176" width="52" height="254" rx="10" fill="url(#tube2)"/>
      <rect x="216" y="176" width="52" height="50" rx="10" fill="#c9a86a"/>
      <path d="M228 176c0-22 4-40 14-48 10 8 14 26 14 48h-28z" fill="#b3261e"/>
    </g>
    ${sparkles("#8f2749", 0.5)}
    <defs>
      <linearGradient id="tube1" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#8f2749"/>
        <stop offset="1" stop-color="#5f1731"/>
      </linearGradient>
      <linearGradient id="tube2" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#2a2018"/>
        <stop offset="1" stop-color="#1f1712"/>
      </linearGradient>
    </defs>`,
  ),
);

put(
  "products/hydra-glow-moisturizer.svg",
  svg(
    `${bgGradient("bg", "#fdf4f6", "#f6eedd")}
    ${ground(450)}
    <rect x="122" y="196" width="156" height="42" rx="12" fill="url(#lid)"/>
    <rect x="112" y="234" width="176" height="190" rx="28" fill="url(#jar)"/>
    <rect x="112" y="234" width="176" height="190" rx="28" stroke="#ece2d4" stroke-width="1.5"/>
    <path d="M136 258c0-14 10-22 18-26v50c-10-2-18-10-18-24z" fill="#ffffff" opacity="0.5"/>
    <rect x="140" y="298" width="120" height="74" rx="10" fill="#fdfbf8"/>
    ${label("HYDRA GLOW", 328)}
    <text x="200" y="352" text-anchor="middle" font-family="Georgia, serif" font-size="10.5" letter-spacing="2" fill="#b08d4f">GLOW MOISTURIZER</text>
    ${sparkles()}
    <defs>
      <linearGradient id="lid" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#d99aab"/>
        <stop offset="1" stop-color="#a83a5e"/>
      </linearGradient>
      <linearGradient id="jar" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#fdfbf8"/>
        <stop offset="1" stop-color="#ece2d4"/>
      </linearGradient>
    </defs>`,
  ),
);

put(
  "products/silk-touch-conditioner.svg",
  svg(
    `${bgGradient("bg", "#f6eedd", "#f8e6eb")}
    ${ground(450)}
    <path d="M168 120h64c8 0 14 6 14 14v22h-92v-22c0-8 6-14 14-14z" fill="url(#gold)"/>
    <rect x="188" y="96" width="24" height="28" rx="6" fill="#8f713c"/>
    <rect x="130" y="156" width="140" height="270" rx="30" fill="url(#body)"/>
    <rect x="152" y="250" width="96" height="112" rx="12" fill="#fdfbf8"/>
    ${label("SILK TOUCH", 288)}
    <text x="200" y="312" text-anchor="middle" font-family="Georgia, serif" font-size="10.5" letter-spacing="2" fill="#b08d4f">CONDITIONER</text>
    ${sparkles()}
    <defs>
      <linearGradient id="gold" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#e2cba0"/>
        <stop offset="1" stop-color="#b08d4f"/>
      </linearGradient>
      <linearGradient id="body" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#c9a86a"/>
        <stop offset="1" stop-color="#8f713c"/>
      </linearGradient>
    </defs>`,
  ),
);

put(
  "products/amber-nights-eau-de-parfum.svg",
  svg(
    `${bgGradient("bg", "#f8e6eb", "#ece2d4")}
    ${ground(450)}
    <rect x="184" y="120" width="32" height="22" rx="4" fill="#1f1712"/>
    <rect x="190" y="142" width="20" height="24" fill="#8c7d6e"/>
    <path d="M140 190c0-16 12-24 24-24h72c12 0 24 8 24 24v200c0 16-12 28-28 28h-64c-16 0-28-12-28-28V190z" fill="url(#amber)"/>
    <path d="M158 196c0-10 6-16 12-18v48c-8-2-12-10-12-30z" fill="#ffffff" opacity="0.3"/>
    <rect x="152" y="270" width="96" height="84" rx="10" fill="#1f1712" opacity="0.85"/>
    ${label("AMBER NIGHTS", 302, "#f6eedd")}
    <text x="200" y="326" text-anchor="middle" font-family="Georgia, serif" font-size="10.5" letter-spacing="2.5" fill="#c9a86a">EAU DE PARFUM</text>
    ${sparkles("#b08d4f", 0.8)}
    <defs>
      <linearGradient id="amber" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#b08d4f"/>
        <stop offset="1" stop-color="#5f1731"/>
      </linearGradient>
    </defs>`,
  ),
);

put(
  "products/nourishing-body-lotion.svg",
  svg(
    `${bgGradient("bg", "#fdf4f6", "#f6eedd")}
    ${ground(450)}
    <rect x="176" y="102" width="48" height="20" rx="5" fill="#e2cba0"/>
    <rect x="186" y="122" width="28" height="16" fill="#b08d4f"/>
    <rect x="138" y="138" width="124" height="292" rx="26" fill="url(#cream)"/>
    <rect x="160" y="252" width="80" height="112" rx="12" fill="#fdfbf8"/>
    ${label("NOURISHING", 288)}
    <text x="200" y="312" text-anchor="middle" font-family="Georgia, serif" font-size="10.5" letter-spacing="2" fill="#b08d4f">BODY LOTION</text>
    ${sparkles()}
    <defs>
      <linearGradient id="cream" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#fbf7f2"/>
        <stop offset="1" stop-color="#ece2d4"/>
      </linearGradient>
    </defs>`,
  ),
);

put(
  "products/gentle-foam-cleanser.svg",
  svg(
    `${bgGradient("bg", "#f8e6eb", "#f5eee5")}
    ${ground(450)}
    <rect x="172" y="108" width="56" height="24" rx="6" fill="url(#pinkCap)"/>
    <rect x="184" y="132" width="32" height="14" fill="#8c7d6e"/>
    <rect x="126" y="146" width="148" height="280" rx="34" fill="url(#pink)"/>
    <path d="M148 172c0-14 10-22 18-26v54c-10-2-18-10-18-28z" fill="#ffffff" opacity="0.4"/>
    <rect x="152" y="258" width="96" height="88" rx="12" fill="#fdfbf8"/>
    ${label("GENTLE FOAM", 292)}
    <text x="200" y="316" text-anchor="middle" font-family="Georgia, serif" font-size="10.5" letter-spacing="2" fill="#b08d4f">CLEANSER · pH 5.5</text>
    ${sparkles()}
    <defs>
      <linearGradient id="pink" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#eecdd6"/>
        <stop offset="1" stop-color="#d99aab"/>
      </linearGradient>
      <linearGradient id="pinkCap" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#a83a5e"/>
        <stop offset="1" stop-color="#7a1f3f"/>
      </linearGradient>
    </defs>`,
  ),
);

put(
  "products/sun-shield-spf50.svg",
  svg(
    `${bgGradient("bg", "#f6eedd", "#fdf4f6")}
    ${ground(450)}
    <circle cx="200" cy="118" r="26" fill="url(#sun)"/>
    <g stroke="#c9a86a" stroke-width="4" stroke-linecap="round">
      <line x1="200" y1="74" x2="200" y2="86"/>
      <line x1="238" y1="90" x2="230" y2="98"/>
      <line x1="162" y1="90" x2="170" y2="98"/>
    </g>
    <rect x="146" y="152" width="108" height="274" rx="24" fill="url(#orange)"/>
    <rect x="166" y="252" width="68" height="96" rx="10" fill="#fdfbf8"/>
    ${label("SUN SHIELD", 286)}
    <text x="200" y="312" text-anchor="middle" font-family="Georgia, serif" font-size="13" font-weight="bold" letter-spacing="1" fill="#b3261e">SPF 50+</text>
    ${sparkles("#b08d4f", 0.5)}
    <defs>
      <linearGradient id="sun" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#e2cba0"/>
        <stop offset="1" stop-color="#c9a86a"/>
      </linearGradient>
      <linearGradient id="orange" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#e2cba0"/>
        <stop offset="1" stop-color="#b08d4f"/>
      </linearGradient>
    </defs>`,
  ),
);

put(
  "products/volumizing-mascara.svg",
  svg(
    `${bgGradient("bg", "#fdf4f6", "#ece2d4")}
    ${ground(450)}
    <rect x="150" y="140" width="44" height="286" rx="14" fill="url(#black)"/>
    <rect x="150" y="140" width="44" height="58" rx="14" fill="#c9a86a"/>
    <rect x="228" y="168" width="12" height="200" rx="6" fill="#8c7d6e"/>
    <g fill="#1f1712">
      <ellipse cx="234" cy="150" rx="10" ry="34"/>
    </g>
    ${label("VOLUME", 330, "#1f1712")}
    <text x="172" y="360" text-anchor="middle" font-family="Georgia, serif" font-size="10.5" letter-spacing="2.5" fill="#b08d4f">MASCARA</text>
    ${sparkles("#8f2749", 0.5)}
    <defs>
      <linearGradient id="black" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#3d3026"/>
        <stop offset="1" stop-color="#1f1712"/>
      </linearGradient>
    </defs>`,
  ),
);

put(
  "products/argan-repair-shampoo.svg",
  svg(
    `${bgGradient("bg", "#f6eedd", "#f5eee5")}
    ${ground(450)}
    <path d="M170 128h60c8 0 14 6 14 14v18h-88v-18c0-8 6-14 14-14z" fill="url(#capBrown)"/>
    <rect x="132" y="160" width="136" height="266" rx="28" fill="url(#brown)"/>
    <path d="M152 186c0-12 8-20 16-24v50c-8-2-16-8-16-26z" fill="#ffffff" opacity="0.3"/>
    <rect x="156" y="256" width="88" height="104" rx="12" fill="#fdfbf8"/>
    ${label("ARGAN REPAIR", 290)}
    <text x="200" y="314" text-anchor="middle" font-family="Georgia, serif" font-size="10.5" letter-spacing="2" fill="#b08d4f">SHAMPOO</text>
    ${sparkles()}
    <defs>
      <linearGradient id="capBrown" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#8f713c"/>
        <stop offset="1" stop-color="#6b5c4e"/>
      </linearGradient>
      <linearGradient id="brown" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#8c7d6e"/>
        <stop offset="1" stop-color="#6b5c4e"/>
      </linearGradient>
    </defs>`,
  ),
);

put(
  "products/tropical-bloom-body-mist.svg",
  svg(
    `${bgGradient("bg", "#fdf4f6", "#f6eedd")}
    ${ground(450)}
    <rect x="182" y="106" width="36" height="20" rx="5" fill="#c9a86a"/>
    <rect x="192" y="126" width="16" height="14" fill="#b08d4f"/>
    <rect x="144" y="140" width="112" height="288" rx="30" fill="url(#peach)"/>
    <g fill="#a83a5e" opacity="0.65">
      <circle cx="178" cy="216" r="9"/>
      <circle cx="196" cy="204" r="7"/>
      <circle cx="212" cy="222" r="6"/>
      <circle cx="190" cy="232" r="5" fill="#c9a86a"/>
    </g>
    <rect x="160" y="272" width="80" height="84" rx="10" fill="#fdfbf8"/>
    ${label("TROPICAL", 302)}
    <text x="200" y="326" text-anchor="middle" font-family="Georgia, serif" font-size="10.5" letter-spacing="2" fill="#b08d4f">BLOOM MIST</text>
    ${sparkles()}
    <defs>
      <linearGradient id="peach" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#eecdd6"/>
        <stop offset="1" stop-color="#e2cba0"/>
      </linearGradient>
    </defs>`,
  ),
);

put(
  "products/pro-makeup-brush-set.svg",
  svg(
    `${bgGradient("bg", "#f8e6eb", "#f6eedd")}
    ${ground(452)}
    <g stroke-linecap="round">
      <g transform="rotate(-16 200 420)">
        <rect x="112" y="252" width="13" height="150" rx="6" fill="#b08d4f"/>
        <path d="M108 252c0-22 5-36 11-42 6 6 11 20 11 42h-22z" fill="#1f1712"/>
      </g>
      <g transform="rotate(-8 200 420)">
        <rect x="152" y="238" width="13" height="168" rx="6" fill="#c9a86a"/>
        <path d="M148 238c0-26 5-42 11-50 6 8 11 24 11 50h-22z" fill="#3d3026"/>
      </g>
      <g transform="rotate(0 200 420)">
        <rect x="193" y="230" width="13" height="180" rx="6" fill="#b08d4f"/>
        <path d="M189 230c0-30 5-48 11-56 6 8 11 26 11 56h-22z" fill="#1f1712"/>
      </g>
      <g transform="rotate(8 200 420)">
        <rect x="234" y="238" width="13" height="168" rx="6" fill="#c9a86a"/>
        <path d="M230 238c0-26 5-42 11-50 6 8 11 24 11 50h-22z" fill="#3d3026"/>
      </g>
      <g transform="rotate(16 200 420)">
        <rect x="274" y="252" width="13" height="150" rx="6" fill="#b08d4f"/>
        <path d="M270 252c0-22 5-36 11-42 6 6 11 20 11 42h-22z" fill="#1f1712"/>
      </g>
    </g>
    ${sparkles("#8f2749", 0.5)}`,
  ),
);

/* ---------- videos (16:9) ---------- */

const videoSvg = (from, to, art) =>
  svg(
    `<defs>
      <linearGradient id="bgv" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${from}"/>
        <stop offset="1" stop-color="${to}"/>
      </linearGradient>
    </defs>
    <rect width="640" height="360" fill="url(#bgv)"/>
    ${art}
    <circle cx="320" cy="180" r="46" fill="#ffffff" opacity="0.92"/>
    <path d="M308 158v44l38-22-38-22z" fill="#7a1f3f"/>
    ${sparkles("#c9a86a", 0.7)}`,
    640,
    360,
  );

put(
  "videos/skincare-routine.svg",
  videoSvg(
    "#f8e6eb",
    "#f6eedd",
    `<g opacity="0.9">
      <rect x="118" y="150" width="34" height="120" rx="10" fill="#c9a86a"/>
      <rect x="124" y="132" width="22" height="20" rx="4" fill="#8f713c"/>
      <rect x="470" y="160" width="56" height="110" rx="14" fill="#d99aab"/>
      <rect x="482" y="140" width="32" height="22" rx="5" fill="#a83a5e"/>
    </g>`,
  ),
);

put(
  "videos/lipstick-tutorial.svg",
  videoSvg(
    "#fdf4f6",
    "#ece2d4",
    `<g>
      <rect x="112" y="150" width="38" height="120" rx="8" fill="#7a1f3f"/>
      <path d="M120 150c0-18 4-32 11-38 7 6 11 20 11 38h-22z" fill="#8f2749"/>
      <rect x="140" y="150" width="38" height="30" rx="6" fill="#c9a86a"/>
      <path d="M455 210c30-24 70-24 100 0-30 26-70 26-100 0z" fill="#a83a5e"/>
      <path d="M455 210c30-10 70-10 100 0-30 8-70 8-100 0z" fill="#7a1f3f"/>
    </g>`,
  ),
);

put(
  "videos/perfume-guide.svg",
  videoSvg(
    "#ece2d4",
    "#f8e6eb",
    `<g>
      <rect x="126" y="140" width="60" height="130" rx="16" fill="#b08d4f"/>
      <rect x="144" y="118" width="24" height="24" rx="4" fill="#1f1712"/>
      <rect x="462" y="150" width="52" height="120" rx="14" fill="#5f1731"/>
      <rect x="476" y="130" width="24" height="22" rx="4" fill="#1f1712"/>
      <circle cx="530" cy="120" r="4" fill="#c9a86a"/>
      <circle cx="544" cy="134" r="3" fill="#c9a86a"/>
      <circle cx="536" cy="150" r="2.5" fill="#c9a86a"/>
    </g>`,
  ),
);

/* ---------- hero + fallback ---------- */

put(
  "hero.svg",
  svg(
    `${bgGradient("heroBg", "#eecdd6", "#f6eedd")}
    <circle cx="300" cy="240" r="150" fill="#fdfbf8" opacity="0.55"/>
    <rect x="268" y="120" width="46" height="24" rx="6" fill="url(#goldHero)"/>
    <rect x="240" y="144" width="102" height="256" rx="24" fill="url(#goldHero)"/>
    <rect x="258" y="266" width="66" height="82" rx="10" fill="#fdfbf8"/>
    <text x="291" y="300" text-anchor="middle" font-family="Georgia, serif" font-size="14" letter-spacing="1" fill="#5f1731">NIFFER</text>
    <text x="291" y="322" text-anchor="middle" font-family="Georgia, serif" font-size="9" letter-spacing="2.5" fill="#b08d4f">COSMETICS</text>
    <g fill="#a83a5e" opacity="0.5">
      <circle cx="128" cy="330" r="34"/>
      <circle cx="166" cy="352" r="24" fill="#c9a86a"/>
      <circle cx="106" cy="366" r="18"/>
    </g>
    ${sparkles("#b08d4f", 0.8)}
    <defs>
      <linearGradient id="goldHero" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#e2cba0"/>
        <stop offset="1" stop-color="#b08d4f"/>
      </linearGradient>
    </defs>`,
    600,
    750,
  ),
);

/* ---------- write all ---------- */

for (const [path, content] of files) {
  writeFileSync(path, content, "utf8");
}
console.log(`✓ Generated ${files.size} images in public/images`);
