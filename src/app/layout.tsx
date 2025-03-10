import { ConvexClientProvider } from "@/provider/convex-provider";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import { ConvexQueryCacheProvider } from "convex-helpers/react/cache/provider";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "4 Horsemen Cricket League",
  description:
    "Join the 4 Horsemen Cricket League – the ultimate fantasy cricket battleground! Compete, strategize, and dominate the game with your dream team. Play now!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ConvexAuthNextjsServerProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <ConvexClientProvider>
            <ConvexQueryCacheProvider> {children}</ConvexQueryCacheProvider>
          </ConvexClientProvider>
          <Toaster richColors />
        </body>
      </html>
    </ConvexAuthNextjsServerProvider>
  );
}
