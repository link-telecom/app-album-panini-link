"use client";

import { useEffect, useMemo, useState } from "react";
import { User } from "firebase/auth";
import { AuthGate } from "@/components/AuthGate";
import { BottomNav } from "@/components/BottomNav";
import { StickerCell } from "@/components/StickerCell";
import {
  CATALOG,
  TEAMS,
  TOTAL_STICKERS,
  Sticker,
} from "@/lib/catalog";
import {
  StickerCountMap,
  setStickerCount,
  subscribeToUserStickers,
  summarize,
} from "@/lib/stickers";

type Filter =
  | { kind: "all" }
  | { kind: "missing" }
  | { kind: "duplicates" }
  | { kind: "intro" }
  | { kind: "museum" }
  | { kind: "team"; teamCode: string };

function AlbumContent({ user }: { user: User }) {
  const [counts, setCounts] = useState<StickerCountMap>({});
  const [filter, setFilter] = useState<Filter>({ kind: "all" });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const unsub = subscribeToUserStickers(user.uid, (m) => {
      setCounts(m);
      setReady(true);
    });
    return () => unsub();
  }, [user.uid]);

  const summary = useMemo(
    () => summarize(counts, TOTAL_STICKERS),
    [counts]
  );

  const filtered = useMemo(() => {
    return CATALOG.filter((s) => {
      const c = counts[s.code] ?? 0;
      switch (filter.kind) {
        case "all":
          return true;
        case "missing":
          return c === 0;
        case "duplicates":
          return c > 1;
        case "intro":
          return s.section === "intro";
        case "museum":
          return s.section === "museum";
        case "team":
          return s.teamCode === filter.teamCode;
      }
    });
  }, [counts, filter]);

  function tap(sticker: Sticker) {
    const current = counts[sticker.code] ?? 0;
    const next = current === 0 ? 1 : 0;
    setStickerCount(user.uid, sticker.code, next);
  }

  function longPress(sticker: Sticker) {
    const current = counts[sticker.code] ?? 0;
    setStickerCount(user.uid, sticker.code, current + 1);
  }

  return (
    <main className="min-h-screen pb-24">
      <header className="sticky top-0 z-30 bg-[var(--color-bg)]/95 backdrop-blur-md border-b border-[var(--color-purple)]/40">
        <div className="max-w-screen-sm mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-lg font-bold">Mi álbum</h1>
            <div className="text-right">
              <p className="text-xs text-[var(--color-text-soft)]">Avance</p>
              <p className="text-lg font-bold brand-gradient-text">
                {summary.owned}/{TOTAL_STICKERS}
              </p>
            </div>
          </div>

          <div className="h-2 rounded-full bg-[var(--color-bg-soft)] overflow-hidden mb-3">
            <div
              className="h-full brand-gradient transition-all duration-300"
              style={{ width: `${summary.percent}%` }}
            />
          </div>

          <FilterBar filter={filter} setFilter={setFilter} summary={summary} />
        </div>
      </header>

      <div className="max-w-screen-sm mx-auto px-3 pt-3">
        {!ready ? (
          <p className="text-center text-[var(--color-text-soft)] py-12">
            Cargando tu álbum...
          </p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-[var(--color-text-soft)] py-12">
            No hay láminas en este filtro.
          </p>
        ) : (
          <>
            <p className="text-xs text-[var(--color-text-soft)] mb-2 text-center">
              Toca para marcar · Mantén presionado para sumar repetida
            </p>
            <div className="grid grid-cols-5 gap-2">
              {filtered.map((s) => (
                <StickerCell
                  key={s.code}
                  sticker={s}
                  count={counts[s.code] ?? 0}
                  onTap={() => tap(s)}
                  onLongPress={() => longPress(s)}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <BottomNav />
    </main>
  );
}

function FilterBar({
  filter,
  setFilter,
  summary,
}: {
  filter: Filter;
  setFilter: (f: Filter) => void;
  summary: { owned: number; duplicates: number; missing: number };
}) {
  const [showTeams, setShowTeams] = useState(false);

  const chips: Array<{ key: string; label: string; filter: Filter }> = [
    { key: "all", label: `Todas (${TOTAL_STICKERS})`, filter: { kind: "all" } },
    { key: "missing", label: `Faltan (${summary.missing})`, filter: { kind: "missing" } },
    { key: "duplicates", label: `Repetidas (${summary.duplicates})`, filter: { kind: "duplicates" } },
    { key: "intro", label: "Intro", filter: { kind: "intro" } },
    { key: "museum", label: "Museum", filter: { kind: "museum" } },
  ];

  return (
    <>
      <div className="flex gap-2 overflow-x-auto -mx-4 px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {chips.map((c) => {
          const active =
            (filter.kind === "all" && c.key === "all") ||
            (filter.kind === "missing" && c.key === "missing") ||
            (filter.kind === "duplicates" && c.key === "duplicates") ||
            (filter.kind === "intro" && c.key === "intro") ||
            (filter.kind === "museum" && c.key === "museum");
          return (
            <button
              key={c.key}
              onClick={() => setFilter(c.filter)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                active
                  ? "brand-gradient text-white"
                  : "bg-[var(--color-bg-soft)] text-[var(--color-text-soft)] border border-[var(--color-purple)]/40"
              }`}
            >
              {c.label}
            </button>
          );
        })}
        <button
          onClick={() => setShowTeams((v) => !v)}
          className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
            filter.kind === "team" || showTeams
              ? "brand-gradient text-white"
              : "bg-[var(--color-bg-soft)] text-[var(--color-text-soft)] border border-[var(--color-purple)]/40"
          }`}
        >
          {filter.kind === "team"
            ? `Equipo: ${filter.teamCode}`
            : "Por equipo ▾"}
        </button>
      </div>

      {showTeams && (
        <div className="mt-2 grid grid-cols-4 gap-1.5 max-h-44 overflow-y-auto pb-1">
          {TEAMS.map((t) => {
            const active = filter.kind === "team" && filter.teamCode === t.code;
            return (
              <button
                key={t.code}
                onClick={() => {
                  setFilter({ kind: "team", teamCode: t.code });
                  setShowTeams(false);
                }}
                className={`px-2 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1 justify-center ${
                  active
                    ? "brand-gradient text-white"
                    : "bg-[var(--color-bg-soft)] text-[var(--color-text-soft)] border border-[var(--color-purple)]/40"
                }`}
              >
                <span>{t.flag}</span>
                <span>{t.code}</span>
              </button>
            );
          })}
        </div>
      )}
    </>
  );
}

export default function AlbumPage() {
  return <AuthGate>{(user) => <AlbumContent user={user} />}</AuthGate>;
}
