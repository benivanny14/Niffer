import { ImageResponse } from "next/og";

export const alt = "Niffer Cosmetics — Urembo halisi, ubora wa juu";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function TwitterImage() {
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
            "linear-gradient(135deg, #0f172a 0%, #1e293b 55%, #172033 100%)",
          fontFamily: "Georgia, serif",
          color: "#f8fafc",
          padding: 64,
        }}
      >
        <svg
          width="96"
          height="96"
          viewBox="0 0 24 24"
          fill="none"
          style={{ marginBottom: 24 }}
        >
          <path
            d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8L12 2z"
            fill="#f43f5e"
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
            color: "#fbbf24",
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
            color: "#fda4af",
            display: "flex",
          }}
        >
          Urembo halisi, ubora wa juu — Tanzania
        </div>
      </div>
    ),
    { ...size },
  );
}
