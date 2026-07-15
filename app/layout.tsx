import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { QualityProvider } from "@/lib/quality";
import MainContent from "@/components/MainContent";
import SmoothScroll from "@/components/immersive/SmoothScroll";
import Cursor from "@/components/Cursor";

// Display — Clash Display (variable). Big cinematic headings + wordmark.
const clash = localFont({
  src: "./fonts/ClashDisplay-Variable.woff2",
  variable: "--font-display",
  weight: "200 700",
  display: "swap",
});

// Body — General Sans (variable).
const general = localFont({
  src: "./fonts/GeneralSans-Variable.woff2",
  variable: "--font-sans",
  weight: "200 700",
  display: "swap",
});

// Mono — JetBrains Mono, for micro "spec" labels.
const jbmono = localFont({
  src: [
    { path: "./fonts/JetBrainsMono-Regular.woff2", weight: "400" },
    { path: "./fonts/JetBrainsMono-Medium.woff2", weight: "500" },
  ],
  variable: "--font-mono",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sneakerair.com";
const ogImage =
  "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=1200&q=80";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Sneaker Air — Premium Sneakers & Drops",
    template: "%s | Sneaker Air",
  },
  description:
    "Step into the future with Sneaker Air. Premium running, basketball, lifestyle, skate & limited-edition sneakers — previewed in live 3D. Free shipping over €100.",
  openGraph: {
    title: "Sneaker Air — Premium Sneakers & Drops",
    description:
      "Premium sneakers for those who move different. Previewed in live 3D.",
    url: siteUrl,
    siteName: "Sneaker Air",
    locale: "en_US",
    type: "website",
    images: [{ url: ogImage, width: 1200, height: 630, alt: "Sneaker Air" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sneaker Air — Premium Sneakers & Drops",
    description: "Premium sneakers for those who move different. Previewed in live 3D.",
    images: [ogImage],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`dark ${clash.variable} ${general.variable} ${jbmono.variable}`}
    >
      <body className="antialiased">
        <QualityProvider>
          <ThemeProvider>
            <LanguageProvider>
              <CartProvider>
                <Cursor />
                <div aria-hidden className="grain-overlay" />
                <SmoothScroll>
                  <MainContent>{children}</MainContent>
                </SmoothScroll>
              </CartProvider>
            </LanguageProvider>
          </ThemeProvider>
        </QualityProvider>
      </body>
    </html>
  );
}
