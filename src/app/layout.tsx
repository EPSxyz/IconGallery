import type { Metadata } from "next";
import { Playfair_Display } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: "Fan Funds — Athlete Philanthropy Directory",
  description: "Discover the charitable foundations and philanthropic work of your favorite athletes and celebrities.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-[#fdfbf7] text-[#2c2c2c] antialiased">
        {children}
      </body>
    </html>
  );
}
