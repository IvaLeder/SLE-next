import { ImageResponse } from "next/og";

// Apple touch icon — shown on iOS home screen at 180×180
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

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
          background:
            "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
          color: "white",
          fontSize: 110,
          fontWeight: 800,
          letterSpacing: -4,
          // No border-radius — iOS masks it to a squircle automatically
        }}
      >
        S
      </div>
    ),
    { ...size }
  );
}
