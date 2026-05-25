import { ImageResponse } from "next/og";

// Favicon — served at /icon at all sizes browsers request
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
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
          fontSize: 20,
          fontWeight: 800,
          letterSpacing: -1,
          borderRadius: 6,
        }}
      >
        S
      </div>
    ),
    { ...size }
  );
}
