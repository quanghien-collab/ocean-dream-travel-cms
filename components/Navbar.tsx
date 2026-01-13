"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-6">
        <div className="h-16 flex items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="h-10 w-10 rounded-full bg-orange-500 shadow-md group-hover:scale-105 transition" />
            <span className="text-lg font-semibold tracking-wide">
              Ocean Dream Travel
            </span>
          </Link>

          {/* Menu */}
          <nav className="flex items-center gap-3">
            <Link href="/tours" className="nav-btn">
              Tours
            </Link>
            <Link href="/contact" className="nav-btn">
              Liên hệ
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
