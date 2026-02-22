"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "ホーム", icon: "🏠" },
  { href: "/fragrances", label: "香り管理", icon: "🌿" },
  { href: "/patterns", label: "パターン一覧", icon: "📁" },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="w-60 bg-slate-900 text-white min-h-screen flex flex-col">
      <div className="p-5 border-b border-slate-700">
        <h1 className="text-lg font-bold">🧪 アロマ診断</h1>
        <p className="text-xs text-slate-400 mt-1">ロジック設計ワークベンチ</p>
      </div>
      <ul className="flex-1 py-4">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-5 py-3 text-sm transition-colors ${
                  isActive
                    ? "bg-slate-700 text-white border-r-2 border-blue-400"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="p-4 border-t border-slate-700 text-xs text-slate-500">
        v0.1 — 先生用ツール
      </div>
    </nav>
  );
}
