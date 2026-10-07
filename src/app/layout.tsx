import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#000000",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://xui.dev"),
  title: "XUI — Next-Gen UI Component Platform",
  description:
    "Highly customizable animated components & backgrounds that drop into your project and instantly make it stand out.",
  icons: {
    icon: "/XUI.png",
    shortcut: "/XUI.png",
    apple: "/XUI.png",
  },
  openGraph: {
    title: "XUI — Next-Gen UI Component Platform",
    description:
      "Highly customizable animated components & backgrounds that drop into your project and instantly make it stand out.",
    url: "https://xui.dev",
    siteName: "XUI",
    images: [
      {
        url: "/XUI.png",
        width: 1080,
        height: 1080,
        alt: "XUI Logo",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "XUI — Next-Gen UI Component Platform",
    description:
      "Highly customizable animated components for creative developers.",
    images: ["/XUI.png"],
  },
};

import { LanguageProvider } from "@/context/LanguageContext";
import { AuthProvider } from "@/context/AuthContext";
import AuthModal from "@/components/auth/AuthModal";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-black text-white m-0 p-0 overflow-x-clip select-none">
        <LanguageProvider>
          <AuthProvider>
            {children}
            <AuthModal />
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
