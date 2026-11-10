"use client";

// Last-resort boundary for errors in the root layout. It must render its own <html> and <body>,
// and cannot rely on app styles or providers, so it uses minimal inline styles.
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en-NG">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#07090d", color: "#f2f5f8" }}>
        <div style={{ maxWidth: 640, margin: "0 auto", padding: "80px 20px" }}>
          <h1 style={{ fontSize: 32, margin: 0 }}>Something went wrong</h1>
          <p style={{ color: "#a6b0bd", fontSize: 18, lineHeight: 1.6 }}>
            Calculate.ng hit an unexpected problem. Please try again.
          </p>
          <button
            onClick={reset}
            style={{ height: 44, padding: "0 20px", borderRadius: 8, border: 0, background: "#22d3c5", color: "#07211f", fontSize: 16, fontWeight: 600, cursor: "pointer" }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
