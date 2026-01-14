"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  const lang = pathname.startsWith("/en") ? "en" : "vi";

  return (
    <header className="bg-white border-b">
      <div className="container-od flex items-center justify-between py-4">

        {/* LOGO */}
        <Link href={`/${lang}`} className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-orange-500"></div>
          <span className="font-semibold text-lg">Ocean Dream Travel</span>
        </Link>

        {/* MENU */}
        <nav className="flex gap-3">
          <Link href={`/${lang}/tours`} className="nav-btn">
            {lang === "vi" ? "Tours" : "Tours"}
          </Link>

          <Link href={`/${lang}/contact`} className="nav-btn">
            {lang === "vi" ? "Liên hệ" : "Contact"}
          </Link>
        </nav>
      </div>
    </header>
  );
}
