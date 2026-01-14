"use client";

import { usePathname, useRouter } from "next/navigation";

export default function TopBar() {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname.startsWith("/admin")) return null;

  function switchLang(lang: "vi" | "en") {
    const newPath = pathname.replace(/^\/(vi|en)/, `/${lang}`);
    router.push(newPath === pathname ? `/${lang}` : newPath);
  }

  return (
    <div style={{ background: "#0a6ed1", color: "white" }}>
      <div className="container-od flex items-center justify-between py-2 text-sm">
        <div className="flex items-center gap-3 text-lg">
          <button onClick={() => switchLang("en")}>🇬🇧</button>
          <button onClick={() => switchLang("vi")}>🇻🇳</button>
        </div>
      </div>
    </div>
  );
}
