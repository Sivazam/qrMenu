import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fork Flow Powered Menu",
  description: "Modern restaurant menu system with advanced filtering and search capabilities",
  keywords: ["restaurant", "menu", "ordering", "food", "beverages", "dining"],
  authors: [{ name: "Fork Flow Team" }],
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.png", sizes: "1024x1024", type: "image/png" },
    ],
    apple: [
      { url: "/favicon.png", sizes: "1024x1024", type: "image/png" },
    ],
  },
  openGraph: {
    title: "Fork Flow Powered Menu",
    description: "Modern restaurant menu system with advanced filtering and search capabilities",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fork Flow Powered Menu",
    description: "Modern restaurant menu system with advanced filtering and search capabilities",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
