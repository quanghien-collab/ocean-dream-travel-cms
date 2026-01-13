"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  // Nếu là trang admin thì KHÔNG render navbar public
  if (pathname.startsWith("/admin")) return null;

  return (
    <header className="border-b bg-white">
      <div className="container-od flex items-center justify-between py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 font-semibold text-lg">
          <div className="h-9 w-9 rounded-full bg-orange-500" />
          Ocean Dream Travel
        </Link>

        {/* Menu public */}
        <nav className="flex items-center gap-3">
          <Link href="/tours" className="btn">
            Tours
          </Link>

          <Link href="/contact" className="btn">
            Liên hệ
          </Link>

          {/* KHÔNG CÓ ADMIN Ở ĐÂY */}
        </nav>
      </div>
    </header>
  );
}
