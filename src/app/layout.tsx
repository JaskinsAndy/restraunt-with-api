import type { Metadata } from "next";
import { Manrope, Playfair_Display } from "next/font/google";
import "./globals.css";

const bodyFont = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const headingFont = Playfair_Display({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Gasthaus Quell - Alpine Fine Dining in Bad Gastein",
  description:
    "Experience Gasthaus Quell in Austria's Gastein Valley with seasonal alpine cuisine, curated wine pairings, and an AI concierge that books your table by phone.",
  keywords: [
    "Gasthaus Quell",
    "Bad Gastein restaurant",
    "Austrian fine dining",
    "alpine cuisine",
    "AI reservation concierge",
  ],
  openGraph: {
    title: "Gasthaus Quell - Alpine Fine Dining",
    description:
      "Contemporary Austrian gastronomy with thermal spring views and an AI concierge reservation experience.",
    type: "website",
    locale: "en_AT",
    siteName: "Gasthaus Quell",
  },
  twitter: {
    card: "summary_large_image",
    title: "Gasthaus Quell - Alpine Fine Dining",
    description:
      "Contemporary Austrian gastronomy with thermal spring views and an AI concierge reservation experience.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${bodyFont.variable} ${headingFont.variable} font-body antialiased`}>
        {children}
      </body>
    </html>
  );
}
