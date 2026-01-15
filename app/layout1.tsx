import "./globals.css";
import type { Metadata } from "next";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import TopBar from "@/app/components/TopBar";

export const metadata: Metadata = {
  title: "Ocean Dream Travel",
  description: "Trang du lịch có CMS realtime (Vercel + Supabase)."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>
        <TopBar />
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
