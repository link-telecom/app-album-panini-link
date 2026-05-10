"use client";

import { useEffect, useMemo, useState } from "react";
import { User } from "firebase/auth";
import { AuthGate } from "@/components/AuthGate";
import { BottomNav } from "@/components/BottomNav";
import { CATALOG_BY_CODE, Sticker } from "@/lib/catalog";
import {
  StickerCountMap,
  getUserStickersOnce,
  subscribeToUserStickers,
} from "@/lib/stickers";
import {
  Friend,
  loadFriendProfiles,
  subscribeToFriendships,
} from "@/lib/friends";

type FriendStickers = {
  friend: Friend;
  counts: StickerCountMap;
};

type Match = {
  sticker: Sticker;
  friend: Friend;
  friendExtras: number;
};

function MatchesContent({ user }: { user: User }) {
  const [myCounts, setMyCounts] = useState<StickerCountMap>({});
  const [friendsData, setFriendsData] = useState<FriendStickers[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"need" | "give">("need");

  useEffect(() => {
    const unsub = subscribeToUserStickers(user.uid, setMyCounts);
    return () => unsub();
  }, [user.uid]);

  useEffect(() => {
    const unsub = subscribeToFriendships(user.uid, async (uids) => {
      const profiles = await loadFriendProfiles(uids);
      const data = await Promise.all(
        profiles.map(async (p) => ({
          friend: p,
          counts: await getUserStickersOnce(p.uid),
        }))
      );
      setFriendsData(data);
      setLoading(false);
    });
    return () => unsub();
  }, [user.uid]);

  const matchesINeed = useMemo<Match[]>(() => {
    const list: Match[] = [];
    friendsData.forEach((fd) => {
      Object.entries(fd.counts).forEach(([code, count]) => {
        if (count > 1) {
          const myCount = myCounts[code] ?? 0;
          if (myCount === 0) {
            const sticker = CATALOG_BY_CODE.get(code);
            if (sticker) {
              list.push({ sticker, friend: fd.friend, friendExtras: count - 1 });
            }
          }
        }
      });
    });
    return list.sort((a, b) => a.sticker.order - b.sticker.order);
  }, [myCounts, friendsData]);

  const matchesIGive = useMemo<Match[]>(() => {
    const list: Match[] = [];
    Object.entries(myCounts).forEach(([code, count]) => {
      if (count > 1) {
        friendsData.forEach((fd) => {
          const friendCount = fd.counts[code] ?? 0;
          if (friendCount === 0) {
            const sticker = CATALOG_BY_CODE.get(code);
            if (sticker) {
              list.push({ sticker, friend: fd.friend, friendExtras: count - 1 });
            }
          }
        });
      }
    });
    return list.sort((a, b) => a.sticker.order - b.sticker.order);
  }, [myCounts, friendsData]);

  const current = view === "need" ? matchesINeed : matchesIGive;
  const grouped = useMemo(() => {
    const map = new Map<string, Match[]>();
    current.forEach((m) => {
      const key = m.friend.uid;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(m);
    });
    return Array.from(map.values()).sort(
      (a, b) => b.length - a.length
    );
  }, [current]);

  return (
    <main className="min-h-screen pb-24">
      <header className="sticky top-0 z-30 bg-[var(--color-bg)]/95 backdrop-blur-md border-b border-[var(--color-purple)]/40">
        <div className="max-w-screen-sm mx-auto px-4 py-4">
          <h1 className="text-lg font-bold mb-3">Cambios disponibles</h1>
          <div className="flex gap-2 bg-[var(--color-bg-soft)] rounded-lg p-1">
            <button
              onClick={() => setView("need")}
              className={`flex-1 py-2 rounded-md text-sm font-semibold transition-all ${
                view === "need"
                  ? "brand-gradient text-white shadow-md"
                  : "text-[var(--color-text-soft)]"
              }`}
            >
              Me sirven ({matchesINeed.length})
            </button>
            <button
              onClick={() => setView("give")}
              className={`flex-1 py-2 rounded-md text-sm font-semibold transition-all ${
                view === "give"
                  ? "brand-gradient text-white shadow-md"
                  : "text-[var(--color-text-soft)]"
              }`}
            >
              Les sirven ({matchesIGive.length})
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-screen-sm mx-auto px-4 pt-4">
        {loading ? (
          <p className="text-center text-[var(--color-text-soft)] py-12">
            Cargando matches...
          </p>
        ) : friendsData.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-5xl mb-4">👥</p>
            <p className="text-[var(--color-text-soft)]">
              Agrega amigos para empezar a cambiar láminas.
            </p>
          </div>
        ) : current.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-5xl mb-4">{view === "need" ? "🔍" : "📭"}</p>
            <p className="text-[var(--color-text-soft)]">
              {view === "need"
                ? "Por ahora ningún amigo tiene repetidas que te falten."
                : "Por ahora no tienes repetidas que les sirvan a tus amigos."}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {grouped.map((group) => {
              const friend = group[0].friend;
              return (
                <section key={friend.uid}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-full brand-gradient flex items-center justify-center font-bold text-white text-sm">
                      {friend.displayName.charAt(0).toUpperCase()}
                    </div>
                    <h2 className="text-sm font-bold">
                      {friend.displayName}{" "}
                      <span className="text-[var(--color-text-soft)] font-normal">
                        · {group.length} {group.length === 1 ? "lámina" : "láminas"}
                      </span>
                    </h2>
                  </div>
                  <div className="bg-[var(--color-bg-soft)]/60 rounded-xl border border-[var(--color-purple)]/40 divide-y divide-[var(--color-purple)]/20">
                    {group.map((m, idx) => (
                      <div
                        key={`${m.sticker.code}-${idx}`}
                        className="px-3 py-3 flex items-center gap-3"
                      >
                        <div
                          className={`w-12 h-12 rounded-lg flex flex-col items-center justify-center font-bold text-xs ${
                            view === "need"
                              ? "brand-gradient text-white"
                              : "bg-[var(--color-gold)] text-[#1a0d2e]"
                          }`}
                        >
                          <span>{m.sticker.code}</span>
                          {m.sticker.flag && (
                            <span className="text-sm">{m.sticker.flag}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm truncate">
                            {m.sticker.name}
                          </p>
                          <p className="text-xs text-[var(--color-text-soft)]">
                            {m.sticker.teamName ?? "Especial"}
                          </p>
                        </div>
                        {view === "need" && m.friendExtras > 1 && (
                          <span className="text-xs text-[var(--color-gold)] font-bold">
                            +{m.friendExtras}
                          </span>
                        )}
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

export default function MatchesPage() {
  return <AuthGate>{(user) => <MatchesContent user={user} />}</AuthGate>;
}
