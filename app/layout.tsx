import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { ThemeProvider } from "@/context/ThemeContext";
import MainContent from "@/components/MainContent";
import SmoothScroll from "@/components/immersive/SmoothScroll";
import CustomCursor from "@/components/immersive/CustomCursor";
import { Manrope, Unbounded, JetBrains_Mono } from "next/font/google";

// Sporty display face for big headings / logo
const unbounded = Unbounded({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700", "800", "900"],
});

// Body text
const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
});

// Micro "spec" / HUD labels
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
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
    "Step into the future with Sneaker Air. Shop premium running, basketball, lifestyle, skate & limited-edition sneakers. Live 3D previews, free shipping over €100, cash on delivery.",
  openGraph: {
    title: "Sneaker Air — Premium Sneakers & Drops",
    description:
      "Premium sneakers for those who move different. Running, basketball, lifestyle, skate & limited drops — previewed in live 3D.",
    url: siteUrl,
    siteName: "Sneaker Air",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: ogImage,
        width: 1200,
        height: 630,
        alt: "Sneaker Air",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sneaker Air — Premium Sneakers & Drops",
    description:
      "Premium sneakers for those who move different. Previewed in live 3D.",
    images: [ogImage],
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
        className={`${manrope.variable} ${unbounded.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <ThemeProvider>
          <LanguageProvider>
            <CartProvider>
              <CustomCursor />
              <SmoothScroll>
                <MainContent>{children}</MainContent>
              </SmoothScroll>
            </CartProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
