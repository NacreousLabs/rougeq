import { ImageResponse } from "next/og";

export const alt = "RougeQ — Winnipeg Jets analytics";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Social share card: the puck-Q mark + wordmark + tagline on a navy field.
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
          background: "#041e42",
          color: "white",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 36 }}>
          <svg width="200" height="200" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="14" cy="16" r="10" fill="#0a3060" />
            <circle cx="14" cy="16" r="5.5" fill="none" stroke="#0b63a3" strokeWidth="1.5" />
            <circle cx="14" cy="16" r="10" fill="none" stroke="#55abc9" strokeWidth="2.5" />
            <path d="M19.5 21.5 L27.5 29" stroke="#55abc9" strokeWidth="3.2" strokeLinecap="round" />
          </svg>
          <div style={{ display: "flex", fontSize: 150, fontWeight: 800, letterSpacing: -4 }}>
            <span>Puck</span>
            <span style={{ color: "#55abc9" }}>Q</span>
          </div>
        </div>
        <div style={{ display: "flex", marginTop: 28, fontSize: 40, color: "#9fb6cc" }}>
          Winnipeg Jets analytics
        </div>
      </div>
    ),
    size,
  );
}
