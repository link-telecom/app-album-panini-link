"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/album", label: "Álbum", icon: "📖" },
  { href: "/repetidas", label: "Repetidas", icon: "🔁" },
  { href: "/matches", label: "Cambios", icon: "🤝" },
  { href: "/amigos", label: "Amigos", icon: "👥" },
  { href: "/perfil", label: "Perfil", icon: "👤" },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[var(--color-bg-soft)]/95 backdrop-blur-md border-t border-[var(--color-purple)]/40 pb-[env(safe-area-inset-bottom)] z-40">
      <div className="max-w-screen-sm mx-auto flex">
        {ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center py-3 text-xs font-medium transition-colors ${
                active
                  ? "text-[var(--color-magenta)]"
                  : "text-[var(--color-text-soft)] hover:text-white"
              }`}
            >
              <span className="text-xl leading-none mb-1">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
