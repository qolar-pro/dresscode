import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { ThemeProvider } from "@/context/ThemeContext";
import MainContent from "@/components/MainContent";
import { Inter, Playfair_Display } from "next/font/google";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({ 
  subsets: ["latin"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: {
    default: "DRESS CODE - Modern Fashion Boutique",
    template: "%s | DRESS CODE"
  },
  description: "Discover the latest trends in women's fashion. Shop dresses, tops, pants, and more with cash on delivery. Free shipping on orders over €100.",
  openGraph: {
    title: "DRESS CODE - Modern Fashion Boutique",
    description: "Discover the latest trends in women's fashion. Shop dresses, tops, pants, and more.",
    url: "https://blancographics.xyz",
    siteName: "DRESS CODE",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "DRESS CODE Fashion",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DRESS CODE - Modern Fashion Boutique",
    description: "Discover the latest trends in women's fashion. Shop dresses, tops, pants, and more.",
    images: ["https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1200&q=80"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${playfair.variable} antialiased`}>
        <ThemeProvider>
          <LanguageProvider>
            <CartProvider>
              <MainContent>{children}</MainContent>
            </CartProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
