"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User } from "firebase/auth";
import { AuthGate } from "@/components/AuthGate";
import { BottomNav } from "@/components/BottomNav";
import { Logo } from "@/components/Logo";
import { getUserProfile, signOut, UserProfile } from "@/lib/auth";
import {
  StickerCountMap,
  subscribeToUserStickers,
  summarize,
} from "@/lib/stickers";
import { TOTAL_STICKERS } from "@/lib/catalog";

function PerfilContent({ user }: { user: User }) {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [counts, setCounts] = useState<StickerCountMap>({});

  useEffect(() => {
    getUserProfile(user.uid).then(setProfile);
  }, [user.uid]);

  useEffect(() => {
    const unsub = subscribeToUserStickers(user.uid, setCounts);
    return () => unsub();
  }, [user.uid]);

  const summary = summarize(counts, TOTAL_STICKERS);

  async function handleSignOut() {
    if (!confirm("¿Cerrar sesión?")) return;
    await signOut();
    router.replace("/");
  }

  return (
    <main className="min-h-screen pb-24">
      <header className="sticky top-0 z-30 bg-[var(--color-bg)]/95 backdrop-blur-md border-b border-[var(--color-purple)]/40">
        <div className="max-w-screen-sm mx-auto px-4 py-4">
          <h1 className="text-lg font-bold">Mi perfil</h1>
        </div>
      </header>

      <div className="max-w-screen-sm mx-auto px-4 pt-6 flex flex-col items-center gap-6">
        <div className="w-24 h-24 rounded-full brand-gradient flex items-center justify-center text-4xl font-bold text-white shadow-xl">
          {profile?.displayName.charAt(0).toUpperCase() ?? "?"}
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-bold">{profile?.displayName ?? "..."}</h2>
          <p className="text-[var(--color-text-soft)]">@{profile?.username ?? "..."}</p>
        </div>

        <div className="w-full bg-[var(--color-bg-soft)]/60 rounded-xl border border-[var(--color-purple)]/40 p-4">
          <h3 className="text-sm font-bold text-[var(--color-text-soft)] mb-3">
            Avance del álbum
          </h3>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-2xl font-bold brand-gradient-text">{summary.owned}</p>
              <p className="text-xs text-[var(--color-text-soft)]">Tengo</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--color-gold)]">
                {summary.duplicates}
              </p>
              <p className="text-xs text-[var(--color-text-soft)]">Repetidas</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--color-text-soft)]">
                {summary.missing}
              </p>
              <p className="text-xs text-[var(--color-text-soft)]">Faltan</p>
            </div>
          </div>
          <div className="h-2 rounded-full bg-[var(--color-bg)] overflow-hidden mt-4">
            <div
              className="h-full brand-gradient transition-all"
              style={{ width: `${summary.percent}%` }}
            />
          </div>
          <p className="text-center text-xs text-[var(--color-text-soft)] mt-2">
            {summary.percent.toFixed(1)}% completado
          </p>
        </div>

        <div className="mt-2">
          <Logo size={80} />
        </div>

        <button
          onClick={handleSignOut}
          className="w-full py-3 rounded-xl font-bold text-red-200 border-2 border-red-500/50 active:scale-95 transition-transform"
        >
          Cerrar sesión
        </button>
      </div>

      <BottomNav />
    </main>
  );
}

export default function PerfilPage() {
  return <AuthGate>{(user) => <PerfilContent user={user} />}</AuthGate>;
}
