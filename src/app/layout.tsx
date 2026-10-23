import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { FacebookPixel } from "@/components/facebook-pixel";
import { GoogleAnalytics } from "@/components/google-analytics";
import { LiveChat } from "@/components/live-chat";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const title =
  "Explainer and Product Demo Videos for SaaS, Startups, and Agencies | Scribebunny";
const shareDescription =
  "Strategy-led explainer, onboarding, and demo videos for SaaS brands, startups, and agencies.";

export const metadata: Metadata = {
  metadataBase: new URL("https://scribebunny.com"),
  alternates: { canonical: "https://scribebunny.com" },
  verification: { google: "IpWMWiYQ64A2Xk9aIul0HxQFp1VTFFAlDXV2g26Pkqc" },
  title,
  description:
    "Scribebunny creates explainer, product demo, onboarding, and white-label video content for SaaS brands, startups, and agencies.",
  icons: {
    icon: "/brand/scribebunny-logo-uploaded.png",
    apple: "/brand/scribebunny-logo-uploaded.png",
  },
  openGraph: {
    title,
    description: shareDescription,
    url: "https://scribebunny.com",
    siteName: "Scribebunny",
    type: "website",
    images: [
      {
        url: "https://scribebunny.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "Scribebunny - Animation Studio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description: shareDescription,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-white font-sans antialiased`}
      >
        <GoogleAnalytics />
        <FacebookPixel />
        <LiveChat />
        {children}
      </body>
    </html>
  );
}
