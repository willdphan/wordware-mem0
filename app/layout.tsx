import type { Metadata } from "next";
import "./globals.css";
import { TopLeftLogo } from "./components/TopLeftLogo";
import { IBM_Plex_Mono } from "next/font/google";

const ibmPlexMono = IBM_Plex_Mono({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-ibm-plex-mono",
});

export const metadata: Metadata = {
  title: "Wordware ReAct UI",
  description: "Wordware ReAct Agent UI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`$${ibmPlexMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <TopLeftLogo />
        {children}
      </body>
    </html>
  );
}
