import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Apple touch icon — same solid mark as favicon.svg, larger canvas. */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#111110",
          borderRadius: 40,
        }}
      >
        <div
          style={{
            width: 132,
            height: 132,
            display: "flex",
            position: "relative",
          }}
        >
          {[22, 46, 70, 94].map((y) => (
            <div
              key={y}
              style={{
                position: "absolute",
                left: 10,
                top: y,
                width: 12,
                height: 12,
                borderRadius: 999,
                background: "#F3F4F6",
              }}
            />
          ))}
          <div
            style={{
              position: "absolute",
              left: 38,
              top: 18,
              width: 14,
              height: 88,
              background: "#F3F4F6",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 38,
              top: 18,
              width: 72,
              height: 14,
              background: "#F3F4F6",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 38,
              top: 50,
              width: 52,
              height: 14,
              background: "#F3F4F6",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 38,
              top: 108,
              width: 72,
              height: 12,
              background: "#F3F4F6",
              opacity: 0.88,
            }}
          />
        </div>
      </div>
    ),
    { ...size },
  );
}
