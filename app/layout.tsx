import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import {SiteHeader} from "@/components/app/layout/site-header"
import {SiteFooter} from "@/components/app/layout/site-footer"
import {Toaster} from "@/components/ui/sonner";

// const nunitoSans = Nunito_Sans({subsets:['latin'],variable:'--font-sans'});

const openSans = Open_Sans({subsets:['latin'], variable: '--font-sans'});

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

export const metadata: Metadata = {
  title: "Oyingold",
  description: "Quality groceries, delivered to your doorstep..",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", "font-sans", openSans.variable)}
    >
      <body className="min-h-full flex flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter/>
        <Toaster />
        </body>
    </html>
  );
}
