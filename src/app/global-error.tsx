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
          background: "#0f172a",
          color: "#f8fafc",
          padding: "24px",
          textAlign: "center",
        }}
      >
        <div>
          <h1 style={{ fontSize: "28px", margin: "0 0 12px" }}>
            Kuna hitilafu kubwa imeotokea
          </h1>
          <p style={{ color: "#94a3b8", margin: "0 0 24px" }}>
            Samahani, tumeshindikana kupakia ukurasa huu. Jaribu tena.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              background: "#be123c",
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
