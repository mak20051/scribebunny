import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { formatUsd, videoPackages } from "@/lib/packages";

export const alt = "Scribebunny explainer and product demo videos";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const HEADLINE = "Explainer & Product Demo Videos";
const SUBHEAD = "For SaaS teams, startups, and agencies";

async function loadDisplayFont(text: string) {
  try {
    const css = await fetch(
      `https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@800&text=${encodeURIComponent(text)}`,
    ).then((response) => response.text());
    const fontUrl = css.match(/src: url\((.+?)\) format/)?.[1];
    if (!fontUrl) return null;
    return await fetch(fontUrl).then((response) => response.arrayBuffer());
  } catch {
    return null;
  }
}

export default async function OpenGraphImage() {
  const startingPrice = formatUsd(
    Math.min(...videoPackages.map((videoPackage) => videoPackage.priceCents)),
  );
  const badge = `Videos from ${startingPrice} · scribebunny.com`;
  const logo = await readFile(
    join(process.cwd(), "public/brand/scribebunny-logo-uploaded.png"),
  );
  const font = await loadDisplayFont(HEADLINE + SUBHEAD + badge);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background:
            "linear-gradient(135deg, #FFF5F5 0%, #FFFFFF 50%, #FFF9F0 100%)",
          border: "12px solid #2D3748",
          fontFamily: font ? "Bricolage Grotesque" : undefined,
          color: "#2D3748",
        }}
      >
        <img
          src={`data:image/png;base64,${logo.toString("base64")}`}
          width={300}
          height={82}
          alt=""
        />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.05 }}>
            {HEADLINE}
          </div>
          <div style={{ fontSize: 40, marginTop: 20, color: "#4A5568" }}>
            {SUBHEAD}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignSelf: "flex-start",
            padding: "14px 30px",
            borderRadius: 999,
            border: "4px solid #2D3748",
            background: "#FF3333",
            color: "#FFFFFF",
            fontSize: 34,
            fontWeight: 700,
          }}
        >
          {badge}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: font
        ? [{ name: "Bricolage Grotesque", data: font, weight: 800, style: "normal" }]
        : undefined,
    },
  );
}
