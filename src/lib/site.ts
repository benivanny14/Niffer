/** Taarifa za duka — badilisha hapa unapobadilisha simu/anwani halisi. */

export const site = {
  name: "Niffer Cosmetics",
  tagline: "Urembo halisi, ubora wa juu",
  phoneDisplay: "+255 754 000 000",
  phoneTel: "+255754000000",
  whatsapp: "255754000000",
  email: "habari@niffercosmetics.co.tz",
  address: "Mtaa wa Samora, Dar es Salaam",
  hours: "Jumatatu–Jumamosi · 9:00–20:00",
  freeShippingThresholdTsh: 50000,
  baseShippingTsh: 3000,
  codEnabled: true,
  socials: {
    instagram: "https://instagram.com/niffercosmetics",
    tiktok: "https://tiktok.com/@niffercosmetics",
    facebook: "https://facebook.com/niffercosmetics",
  },
} as const;

export const paymentMethods = [
  { id: "mpesa", label: "M-Pesa", note: "Lipa kwa simu yako" },
  { id: "mixx", label: "Mixx by Yas", note: "Lipa kwa simu yako" },
  { id: "airtel", label: "Airtel Money", note: "Lipa kwa simu yako" },
  { id: "cod", label: "Malipo poa", note: "Lipa baada ya kupokea" },
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
