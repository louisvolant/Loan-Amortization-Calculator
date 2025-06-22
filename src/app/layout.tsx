// src/app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Image from "next/image";
import "./globals.css";
import Footer from "./Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mortgage Amortization Calculator",
  description: "Calculate and rebuild your mortgage amortization schedule with ease.",
  keywords: "mortgage calculator, loan amortization, amortization schedule, mortgage repayment, financial planning",
  openGraph: {
    title: "Mortgage Amortization Calculator",
    description: "Easily calculate and visualize your mortgage amortization schedule based on loan details or sample data.",
    type: "website",
    url: "https://amortization.louisvolant.com",
    images: ["/icon_calculator.png"],
  },
  icons: [
    { rel: "icon", url: "/icon_calculator.svg" },
    { rel: "apple-touch-icon", url: "/icon_calculator.svg" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 transition-colors duration-300`}>
        <header className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-800 dark:to-purple-800 text-white py-4 shadow-md">
          <div className="container mx-auto px-4 flex items-center">
            <Image
              src="/icon_calculator.png"
              alt="Mortgage Calculator Logo"
              width={32}
              height={32}
              priority
              className="h-8 w-8 mr-2"
            />
            <h1 className="text-2xl font-bold">Mortgage Amortization Calculator</h1>
          </div>
        </header>
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}