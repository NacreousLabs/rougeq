import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Apple touch icon: the RougeQ mark on a rouge rounded tile.
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#8a2830",
        }}
      >
        <svg width="132" height="132" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="14" cy="15.5" r="8.5" fill="#ffc72c" />
          <circle cx="14" cy="15.5" r="4.4" fill="none" stroke="#8a1420" strokeWidth="1.3" />
          <circle cx="14" cy="15.5" r="8.5" fill="none" stroke="#8a1420" strokeWidth="2.4" />
          <path d="M18.5 20 L25.5 26.5" stroke="#8a1420" strokeWidth="2.9" strokeLinecap="round" />
        </svg>
      </div>
    ),
    size,
  );
}
