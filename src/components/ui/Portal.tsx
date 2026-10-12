"use client";

import { createPortal } from "react-dom";
import type { ReactNode } from "react";

/**
 * Portal hadi kwenye `<body>`.
 *
 * Muhimu: kichwa chetu kina `backdrop-blur` (backdrop-filter) ambayo hufanya
 * iwe "containing block" ya vipengele vya `position: fixed`. Bila portal,
 * drawer/modal zilizo ndani ya kichwa hubaki ndani ya kichwa pekee na
 * kuonekana "zimejificha" ndani ya maudhui ya ukurasa mwingine.
 */
export function Portal({ children }: { children: ReactNode }) {
  if (typeof document === "undefined") return null;
  return createPortal(children, document.body);
}
