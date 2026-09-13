import { ImageResponse } from "next/og";

export const alt = "Cynova | Turn real work into quests you can finish";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 80,
        color: "#F5F2FF",
        background: "#070A12",
        fontFamily: "serif",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", maxWidth: 740 }}>
        <div style={{ color: "#4DE8E0", fontSize: 28, letterSpacing: 8 }}>
          CYNOVA · LIFE RPG
        </div>
        <div style={{ fontSize: 74, lineHeight: 1.05, marginTop: 28 }}>
          Turn real work into quests you can finish.
        </div>
        <div style={{ color: "#AAB3C5", fontSize: 30, marginTop: 28 }}>
          Plan the task. Do the work. Record the progress.
        </div>
      </div>
      <div
        style={{
          display: "flex",
          width: 240,
          height: 290,
          clipPath:
            "polygon(50% 0, 88% 30%, 72% 86%, 50% 100%, 28% 86%, 12% 30%)",
          background: "#4DE8E0",
          border: "12px solid #3B82F6",
        }}
      />
    </div>,
    size,
  );
}
