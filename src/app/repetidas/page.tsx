"use client";

import { useEffect, useMemo, useState } from "react";
import { User } from "firebase/auth";
import { AuthGate } from "@/components/AuthGate";
import { BottomNav } from "@/components/BottomNav";
import {
  CATALOG_BY_CODE,
  Sticker,
  TEAMS_BY_CODE,
} from "@/lib/catalog";
import {
  StickerCountMap,
  setStickerCount,
  subscribeToUserStickers,
} from "@/lib/stickers";

type Row = {
  sticker: Sticker;
  extras: number;
};

function RepetidasContent({ user }: { user: User }) {
  const [counts, setCounts] = useState<StickerCountMap>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const unsub = subscribeToUserStickers(user.uid, (m) => {
      setCounts(m);
      setReady(true);
    });
    return () => unsub();
  }, [user.uid]);

  const rows = useMemo<Row[]>(() => {
    const list: Row[] = [];
    Object.entries(counts).forEach(([code, count]) => {
      if (count > 1) {
        const sticker = CATALOG_BY_CODE.get(code);
        if (sticker) list.push({ sticker, extras: count - 1 });
      }
    });
    return list.sort((a, b) => a.sticker.order - b.sticker.order);
  }, [counts]);

  const groupedByTeam = useMemo(() => {
    const map = new Map<string, Row[]>();
    rows.forEach((r) => {
      const key = r.sticker.teamCode ?? r.sticker.section.toUpperCase();
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(r);
    });
    return Array.from(map.entries());
  }, [rows]);

  const totalExtras = rows.reduce((sum, r) => sum + r.extras, 0);

  function decrement(code: string) {
    const c = counts[code] ?? 0;
    setStickerCount(user.uid, code, Math.max(0, c - 1));
  }

  function increment(code: string) {
    const c = counts[code] ?? 0;
    setStickerCount(user.uid, code, c + 1);
  }

  return (
    <main className="min-h-screen pb-24">
      <header className="sticky top-0 z-30 bg-[var(--color-bg)]/95 backdrop-blur-md border-b border-[var(--color-purple)]/40">
        <div className="max-w-screen-sm mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold">Mis repetidas</h1>
            <div className="text-right">
              <p className="text-xs text-[var(--color-text-soft)]">Total extras</p>
              <p className="text-lg font-bold brand-gradient-text">{totalExtras}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-screen-sm mx-auto px-4 pt-4">
        {!ready ? (
          <p className="text-center text-[var(--color-text-soft)] py-12">Cargando...</p>
        ) : rows.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-5xl mb-4">📭</p>
            <p className="text-[var(--color-text-soft)]">
              Aún no tienes láminas repetidas.
            </p>
            <p className="text-xs text-[var(--color-text-soft)] mt-2">
              Cuando abras un sobre y te salga una repetida, márcala en el álbum manteniendo presionado.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {groupedByTeam.map(([key, items]) => {
              const team = TEAMS_BY_CODE.get(key);
              const title = team ? `${team.flag} ${team.name}` : key;
              return (
                <section key={key}>
                  <h2 className="text-sm font-bold text-[var(--color-text-soft)] mb-2">
                    {title}
                  </h2>
                  <div className="bg-[var(--color-bg-soft)]/60 rounded-xl border border-[var(--color-purple)]/40 divide-y divide-[var(--color-purple)]/20">
                    {items.map((r) => (
                      <div key={r.sticker.code} className="px-3 py-3 flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-base">{r.sticker.code}</p>
                          <p className="text-xs text-[var(--color-text-soft)] truncate">
                            {r.sticker.name}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => decrement(r.sticker.code)}
                            className="w-9 h-9 rounded-lg bg-[var(--color-bg)] border border-[var(--color-purple)]/40 text-lg font-bold active:scale-95"
                            aria-label="Quitar una"
                          >
                            −
                          </button>
                          <span className="min-w-[2ch] text-center font-bold text-[var(--color-gold)]">
                            +{r.extras}
                          </span>
                          <button
                            onClick={() => increment(r.sticker.code)}
                            className="w-9 h-9 rounded-lg brand-gradient text-lg font-bold active:scale-95"
                            aria-label="Sumar una"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>

      <BottomNav />
    </main>
  );
}

export default function RepetidasPage() {
  return <AuthGate>{(user) => <RepetidasContent user={user} />}</AuthGate>;
}
