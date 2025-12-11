// app/layout.tsx  (Server Component ✅)
import type { Metadata, Viewport } from "next";
import { Lexend } from "next/font/google";
import "./globals.css";
import ClientWrapper from "./ClientWrapper";

const lexend = Lexend({ subsets: ["latin"] });

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

      <body className={lexend.className}>
        <ClientWrapper>{children}</ClientWrapper>
      </body>
    </html>
  );
}