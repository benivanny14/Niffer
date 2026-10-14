/** Store information — badilisha hapa unapobadilisha simu/anwani halisi. */

export const site = {
  name: "Niffer Cosmetics",
  tagline: "Thoughtfully chosen beauty, with care",
  phoneDisplay: "+255 747 340 170",
  phoneTel: "+255747340170",
  whatsapp: "255747340170",
  email: "habari@niffercosmetics.co.tz",
  address: "Samora Street, Dar es Salaam",
  hours: "Monday through Saturday, 9:00 AM to 8:00 PM",
  freeShippingThresholdTsh: 50000,
  baseShippingTsh: 3000,
  codEnabled: true,
  socials: {
    instagram: "https://www.instagram.com/niffer_cosmetics1/",
    tiktok: "https://tiktok.com/@niffercosmetics",
    facebook: "https://facebook.com/niffercosmetics",
  },
} as const;

export const paymentMethods = [
  { id: "mpesa", label: "M-Pesa", note: "Pay with your phone" },
  { id: "mixx", label: "Mixx by Yas", note: "Pay with your phone" },
  { id: "airtel", label: "Airtel Money", note: "Pay with your phone" },
  { id: "cod", label: "Cash on delivery", note: "Pay when your order arrives" },
] as const;

export type PaymentId = (typeof paymentMethods)[number]["id"];

export const tanzaniaRegions = [
  "Dar es Salaam",
  "Arusha",
  "Dodoma",
  "Mbeya",
  "Mwanza",
  "Tanga",
  "Morogoro",
  "Iringa",
  "Kilimanjaro",
  "Zanzibar",
  "Songea",
  "Musoma",
  "Tabora",
  "Kigoma",
] as const;

export type TanzaniaRegion = (typeof tanzaniaRegions)[number];

/**
 * Miji ndani ya kila mkoa — mtindo wa jiji.com (chagua mkoa kisha mji).
 * Bidhaa na matawi hutumia orodha hii katika uchujaji wa eneo.
 */
export const tanzaniaCities: Record<TanzaniaRegion, readonly string[]> = {
  "Dar es Salaam": ["Kinondoni", "Ilala", "Temeke", "Ubungo", "Kigamboni"],
  Arusha: ["Arusha City", "Meru", "Karatu", "Monduli"],
  Dodoma: ["Dodoma City", "Chamwino", "Bahi"],
  Mbeya: ["Mbeya City", "Rungwe", "Kyela"],
  Mwanza: ["Nyamagana", "Ilemela", "Sengerema", "Magu"],
  Tanga: ["Tanga City", "Pangani", "Muheza"],
  Morogoro: ["Morogoro City", "Kilosa", "Kilombero"],
  Iringa: ["Iringa City", "Mafinga"],
  Kilimanjaro: ["Moshi City", "Hai", "Rombo"],
  Zanzibar: ["North Unguja", "South Unguja", "Urban West"],
  Songea: ["Songea City", "Mbinga"],
  Musoma: ["Musoma Jiji", "Bariadi"],
  Tabora: ["Tabora City", "Nzega"],
  Kigoma: ["Kigoma City", "Kasulu"],
};

/** Miji yote (bila kujali mkoa). */
export const allCities: string[] = Object.values(tanzaniaCities).flat();

/** Angalia kama mkoa upo orodhani. */
export function isRegion(value: string): value is TanzaniaRegion {
  return (tanzaniaRegions as readonly string[]).includes(value);
}

/** Angalia kama mji upo ndani ya mkoa fulani. */
export function isCityInRegion(region: string, city: string): boolean {
  if (!isRegion(region)) return false;
  return tanzaniaCities[region].includes(city);
}

/** Muda wa kazi kwa siku (Jumatatu=1 ... Jumapili=0). */
export const isShopOpen = (now = new Date()): boolean => {
  const day = now.getDay();
  const minutes = now.getHours() * 60 + now.getMinutes();
  const open = 9 * 60;
  const close = 20 * 60;
  return day >= 1 && day <= 6 && minutes >= open && minutes < close;
};

export function waLink(message: string): string {
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(message)}`;
}
