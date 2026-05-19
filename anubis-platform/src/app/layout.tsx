import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Cormorant_Garamond } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ANUBIS — Memorial Community Platform",
  description: "Honor and preserve the memory of your loved ones. Save gravesite locations, share stories, and connect with others who cherish the same memories.",
  keywords: ["gravesite locator", "memorial", "cemetery", "ANUBIS", "RR&W"],
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${cormorant.variable}`}>
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2240572702544337"
          crossOrigin="anonymous"
        />
      </head>
      <body className="antialiased bg-[#0D0D0D] text-[#F5F0E8] min-h-screen">
        {children}
      </body>
    </html>
  );
}
