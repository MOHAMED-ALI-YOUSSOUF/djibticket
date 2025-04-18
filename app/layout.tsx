import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import {ClerkProvider} from '@clerk/nextjs'
import { ConvexClientProvider } from "@/components/ConvexClientProvider";
import Header from "@/components/Header";
import SyncUserWithConvex from "@/components/SyncUserWithConvex";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Djib-Ticket - Achetez vos billets pour les événements à Djibouti",
  description: "Découvrez et réservez des billets pour des concerts, matchs, et événements culturels à Djibouti avec Djib-Ticket.",
  openGraph: {
    title: "Djib-Ticket",
    description: "Achetez vos billets pour les événements à Djibouti.",
    url: "https://djib-ticket.com",
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
        <ConvexClientProvider>
        <ClerkProvider>
           
          <Header />
          <SyncUserWithConvex  />
        {children}
        <Toaster />
          </ClerkProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
