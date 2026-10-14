"use client";

/** Linashughulikia hitilafu za root/shell (layout + html/body). */
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="sw">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          background: "#f2ece2",
          color: "#1c1917",
          padding: "24px",
          textAlign: "center",
        }}
      >
        <div>
          <h1 style={{ fontSize: "28px", margin: "0 0 12px" }}>
            Kuna hitilafu kubwa imeotokea
          </h1>
          <p style={{ color: "#78716c", margin: "0 0 24px" }}>
            Samahani, tumeshindikana kupakia ukurasa huu. Jaribu tena.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              background: "#8f2749",
              color: "#fff",
              border: 0,
              borderRadius: "9999px",
              padding: "12px 28px",
              fontSize: "15px",
              cursor: "pointer",
            }}
          >
            Jaribu Tena
          </button>
        </div>
      </body>
    </html>
  );
}
