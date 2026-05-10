"use client";

import { useEffect, useState, FormEvent } from "react";
import { User } from "firebase/auth";
import { AuthGate } from "@/components/AuthGate";
import { BottomNav } from "@/components/BottomNav";
import {
  Friend,
  addFriend,
  findUserByUsername,
  loadFriendProfiles,
  removeFriend,
  subscribeToFriendships,
} from "@/lib/friends";

function AmigosContent({ user }: { user: User }) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(true);
  const [search, setSearch] = useState("");
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const unsub = subscribeToFriendships(user.uid, async (uids) => {
      const profiles = await loadFriendProfiles(uids);
      setFriends(profiles);
      setLoadingFriends(false);
    });
    return () => unsub();
  }, [user.uid]);

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSearching(true);
    try {
      const found = await findUserByUsername(search);
      if (!found) {
        setError("No encontramos a nadie con ese usuario.");
      } else if (found.uid === user.uid) {
        setError("Ese eres tú 😄");
      } else if (friends.some((f) => f.uid === found.uid)) {
        setError(`${found.displayName} ya es tu amigo.`);
      } else {
        await addFriend(user.uid, found.uid);
        setSuccess(`¡${found.displayName} agregado!`);
        setSearch("");
      }
    } catch {
      setError("No pudimos agregar a ese usuario. Intenta de nuevo.");
    } finally {
      setSearching(false);
    }
  }

  async function handleRemove(friend: Friend) {
    if (!confirm(`¿Quitar a ${friend.displayName} de tus amigos?`)) return;
    await removeFriend(user.uid, friend.uid);
  }

  return (
    <main className="min-h-screen pb-24">
      <header className="sticky top-0 z-30 bg-[var(--color-bg)]/95 backdrop-blur-md border-b border-[var(--color-purple)]/40">
        <div className="max-w-screen-sm mx-auto px-4 py-4">
          <h1 className="text-lg font-bold">Mis amigos</h1>
        </div>
      </header>

      <div className="max-w-screen-sm mx-auto px-4 pt-4 flex flex-col gap-6">
        <section className="bg-[var(--color-bg-soft)]/60 rounded-xl border border-[var(--color-purple)]/40 p-4">
          <h2 className="text-sm font-bold mb-3">Agregar un amigo</h2>
          <form onSubmit={handleAdd} className="flex gap-2">
            <input
              type="text"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              value={search}
              onChange={(e) =>
                setSearch(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))
              }
              placeholder="usuario de tu amigo"
              className="flex-1 bg-[var(--color-bg)] border border-[var(--color-purple)]/60 rounded-lg px-3 py-2 outline-none focus:border-[var(--color-magenta)]"
              required
              minLength={3}
              disabled={searching}
            />
            <button
              type="submit"
              disabled={searching || !search}
              className="brand-gradient px-4 rounded-lg font-bold text-white active:scale-95 disabled:opacity-50"
            >
              {searching ? "..." : "Agregar"}
            </button>
          </form>
          {error && (
            <p className="text-sm text-red-300 bg-red-900/30 border border-red-500/40 rounded-lg px-3 py-2 mt-3">
              {error}
            </p>
          )}
          {success && (
            <p className="text-sm text-green-200 bg-green-900/30 border border-green-500/40 rounded-lg px-3 py-2 mt-3">
              {success}
            </p>
          )}
        </section>

        <section>
          <h2 className="text-sm font-bold text-[var(--color-text-soft)] mb-2">
            Tus amigos ({friends.length})
          </h2>
          {loadingFriends ? (
            <p className="text-center text-[var(--color-text-soft)] py-8">
              Cargando...
            </p>
          ) : friends.length === 0 ? (
            <div className="bg-[var(--color-bg-soft)]/60 rounded-xl border border-[var(--color-purple)]/40 px-4 py-8 text-center">
              <p className="text-5xl mb-3">👥</p>
              <p className="text-[var(--color-text-soft)] text-sm">
                Aún no tienes amigos. Pide a tu amigo que se cree una cuenta y compártete su usuario.
              </p>
            </div>
          ) : (
            <div className="bg-[var(--color-bg-soft)]/60 rounded-xl border border-[var(--color-purple)]/40 divide-y divide-[var(--color-purple)]/20">
              {friends.map((f) => (
                <div key={f.uid} className="px-4 py-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full brand-gradient flex items-center justify-center font-bold text-white">
                    {f.displayName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold truncate">{f.displayName}</p>
                    <p className="text-xs text-[var(--color-text-soft)] truncate">
                      @{f.username}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemove(f)}
                    className="text-xs text-red-300 px-2 py-1 rounded-md border border-red-500/40 active:scale-95"
                  >
                    Quitar
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <BottomNav />
    </main>
  );
}

export default function AmigosPage() {
  return <AuthGate>{(user) => <AmigosContent user={user} />}</AuthGate>;
}
