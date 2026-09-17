// src/app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Image from "next/image";
import "./globals.css";
import Footer from "./Footer";
import ServiceWorkerRegistrar from "../components/ServiceWorkerRegistrar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://loan-amortization-calculator.louisvolant.com"),
  title: "Loan Amortization Calculator",
  description: "Calculate and rebuild your loan amortization schedule with ease.",
  keywords: "mortgage calculator, loan amortization, amortization schedule, mortgage repayment, financial planning",
  applicationName: "Loan Amortization Calculator",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Loan Amortization Calculator",
  },
  // Explicit Apple tags that recent Next.js versions no longer emit for `appleWebApp`.
  other: {
    "apple-mobile-web-app-capable": "yes",
  },
  openGraph: {
    title: "Loan Amortization Calculator",
    description: "Easily calculate and visualize your mortgage amortization schedule based on loan details or sample data.",
    type: "website",
    url: "https://loan-amortization-calculator.louisvolant.com",
    images: ["/icon-512.png"],
  },
  icons: [
    { rel: "icon", url: "/logo.svg", type: "image/svg+xml" },
    { rel: "icon", url: "/favicon.png", sizes: "48x48", type: "image/png" },
    { rel: "icon", url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    { rel: "icon", url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    { rel: "apple-touch-icon", url: "/apple-touch-icon.png", sizes: "180x180" },
    { rel: "mask-icon", url: "/mask-icon.svg", color: "#2563eb" },
  ],
};

export const viewport: Viewport = {
  themeColor: "#2563eb",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-200`}>
        <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/80 shadow-xs">
          <div className="container mx-auto px-4 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center p-1.5 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-sm">
                <Image
                  src="/logo-64.png"
                  alt="Loan Amortization Calculator logo"
                  width={28}
                  height={28}
                  priority
                  className="h-7 w-7 rounded-lg"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                  Loan Amortization Calculator
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                  Smart mortgage schedule & visualization
                </p>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <Footer />
        <ServiceWorkerRegistrar />
      </body>
    </html>
  );
}