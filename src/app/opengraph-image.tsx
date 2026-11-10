import { ImageResponse } from "next/og";

export const alt = "Calculate.ng: free Nigerian calculators for tax, loans, savings and more";
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
          justifyContent: "space-between",
          background: "#07090d",
          color: "#f2f5f8",
          padding: 72,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 34, color: "#22d3c5", letterSpacing: 2 }}>CALCULATE.NG</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 76, fontWeight: 700, lineHeight: 1.05 }}>
            Free Nigerian calculators for tax, loans, savings and more
          </div>
          <div style={{ display: "flex", fontSize: 34, color: "#a6b0bd", marginTop: 28 }}>
            2026 PAYE under the Nigeria Tax Act 2025. Clear workings, no sign-up.
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 28, color: "#a6b0bd" }}>Built by Devchi Digital</div>
      </div>
    ),
    size,
  );
}
