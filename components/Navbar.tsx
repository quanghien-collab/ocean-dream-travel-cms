"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabaseClient";

export default function Navbar() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const sb = getSupabase();
    sb.auth.getSession().then(async ({ data }) => {
      const user = data.session?.user;
      if (!user) return setIsAdmin(false);
      // check admin role via profiles table
      const { data: profile } = await sb.from("profiles").select("role").eq("id", user.id).maybeSingle();
      setIsAdmin(profile?.role === "admin");
    });
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/70 backdrop-blur">
      <div className="container-od flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="h-9 w-9 rounded-2xl" style={{ background: "rgb(var(--brand))" }} />
          <span>Ocean Dream Travel</span>
        </Link>

        <nav className="flex items-center gap-3">
          <Link href="/tours" className="btn">Tours</Link>
          <Link href="/contact" className="btn">Liên hệ</Link>
         </nav>
      </div>
    </header>
  );
}
