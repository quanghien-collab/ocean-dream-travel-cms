import "./globals.css";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Ocean Dream Travel",
  description: "Trang du lịch có CMS realtime (Vercel + Supabase)."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
