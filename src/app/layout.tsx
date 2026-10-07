import type { Metadata } from "next";
import { Geist_Mono, Caveat, Patrick_Hand, Playpen_Sans } from "next/font/google";
import "@fontsource/chiron-goround-tc";
import "leaflet/dist/leaflet.css";
import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const caveat = Caveat({
  variable: "--font-handwriting",
  subsets: ["latin"],
});

const patrickHand = Patrick_Hand({
  weight: "400",
  variable: "--font-patrick",
  subsets: ["latin"],
});

const playpenSans = Playpen_Sans({
  variable: "--font-playpen",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AralNook",
  description: "Find your perfect study spot",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistMono.variable} ${caveat.variable} ${patrickHand.variable} ${playpenSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
