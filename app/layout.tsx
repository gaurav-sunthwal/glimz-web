import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";
import TabsNevbar from "../components/TabsNevbar";
const inter = Inter({ subsets: ["latin"] });

import type { Viewport } from "next";

export const metadata: Metadata = {
  title: "Glimz - AI-Powered Streaming Platform",
  description:
    "Discover and watch amazing content powered by AI recommendations",
  keywords: "streaming, movies, shows, AI, entertainment",
  authors: [{ name: "Glimz Team" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <Suspense>
          <TabsNevbar />
          {children}
        </Suspense>
      </body>
    </html>
  );
}
