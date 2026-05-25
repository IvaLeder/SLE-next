import { ImageResponse } from "next/og";

// Default OG image for the whole site — used when a page doesn't define its own.
// Generated as a 1200×630 JPG/PNG at build time by Next.js.
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "STEM Little Explorers — hands-on STEM activities for curious kids";

export default function Image() {
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
            "linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #ec4899 100%)",
          color: "white",
          padding: 80,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 32,
            opacity: 0.85,
            marginBottom: 24,
            letterSpacing: 4,
            textTransform: "uppercase",
          }}
        >
          STEM Little Explorers
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            fontSize: 96,
            fontWeight: 800,
            textAlign: "center",
            lineHeight: 1.05,
            marginBottom: 32,
          }}
        >
          <span>Hands-on STEM</span>
          <span>for Curious Kids</span>
        </div>
        <div
          style={{
            fontSize: 30,
            opacity: 0.85,
            textAlign: "center",
            maxWidth: 900,
          }}
        >
          Experiments · Activities · Child development
        </div>
      </div>
    ),
    { ...size }
  );
}
