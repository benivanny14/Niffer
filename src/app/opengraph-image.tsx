import { ImageResponse } from "next/og";

export const alt = "Niffer Cosmetics — Urembo halisi, ubora wa juu";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(135deg, #eecdd6 0%, #f5eee5 50%, #f6eedd 100%)",
          fontFamily: "Georgia, serif",
          color: "#4a1225",
          padding: 64,
        }}
      >
        {/* Sparkle */}
        <svg
          width="96"
          height="96"
          viewBox="0 0 24 24"
          fill="none"
          style={{ marginBottom: 24 }}
        >
          <path
            d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8L12 2z"
            fill="#a83a5e"
          />
        </svg>

        <div
          style={{
            fontSize: 76,
            fontWeight: 700,
            letterSpacing: -2,
            display: "flex",
          }}
        >
          Niffer
        </div>
        <div
          style={{
            fontSize: 26,
            letterSpacing: 16,
            color: "#b08d4f",
            marginTop: 8,
            display: "flex",
          }}
        >
          COSMETICS
        </div>

        <div
          style={{
            fontSize: 30,
            marginTop: 40,
            color: "#5f1731",
            display: "flex",
          }}
        >
          Urembo halisi, ubora wa juu — Tanzania
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 40,
            fontSize: 22,
            color: "#6b5c4e",
            display: "flex",
          }}
        >
          Skincare · Makeup · Nywele · Harufu
        </div>
      </div>
    ),
    { ...size },
  );
}
