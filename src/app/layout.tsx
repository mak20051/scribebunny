import type { Metadata } from "next";
import { Bricolage_Grotesque, Caveat, Outfit } from "next/font/google";
import { FacebookPixel } from "@/components/facebook-pixel";
import { GoogleAnalytics } from "@/components/google-analytics";
import { LiveChat } from "@/components/live-chat";
import { pageMetadata } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  verification: { google: "IpWMWiYQ64A2Xk9aIul0HxQFp1VTFFAlDXV2g26Pkqc" },
  icons: {
    icon: "/brand/scribebunny-logo-uploaded.png",
    apple: "/brand/scribebunny-logo-uploaded.png",
  },
  ...pageMetadata({
    title: "Explainer & Product Demo Videos for SaaS | Scribebunny",
    description:
      "Scribebunny creates explainer, product demo, onboarding, and white-label video content for SaaS brands, startups, and agencies.",
    shareDescription:
      "Strategy-led explainer, onboarding, and demo videos for SaaS brands, startups, and agencies.",
    path: "/",
  }),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${outfit.variable} ${bricolage.variable} ${caveat.variable} bg-white font-sans antialiased`}
      >
        <GoogleAnalytics />
        <FacebookPixel />
        <LiveChat />
        {children}
      </body>
    </html>
  );
}
