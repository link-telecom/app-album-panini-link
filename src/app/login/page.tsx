"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { loginUser, AuthError } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await loginUser(username, pin);
      router.replace("/album");
    } catch (err) {
      if (err instanceof AuthError) {
        setError(err.message);
      } else {
        setError("Algo salió mal. Intenta de nuevo.");
      }
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm flex flex-col items-center gap-6">
        <Link href="/" className="active:scale-95 transition-transform">
          <Logo size={120} />
        </Link>

        <h1 className="text-2xl font-bold mt-2">Entrar a tu álbum</h1>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          <div>
            <label className="block text-sm text-[var(--color-text-soft)] mb-2">
              Usuario
            </label>
            <input
              type="text"
              autoComplete="username"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-[var(--color-bg-soft)] border border-[var(--color-purple)] rounded-xl px-4 py-3 text-lg outline-none focus:border-[var(--color-magenta)]"
              placeholder="tu_usuario"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm text-[var(--color-text-soft)] mb-2">
              PIN (4 dígitos)
            </label>
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]{4}"
              maxLength={4}
              autoComplete="current-password"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
              className="w-full bg-[var(--color-bg-soft)] border border-[var(--color-purple)] rounded-xl px-4 py-3 text-2xl text-center tracking-[0.5em] outline-none focus:border-[var(--color-magenta)]"
              placeholder="••••"
              required
              disabled={loading}
            />
          </div>

          {error && (
            <p className="text-sm text-red-300 bg-red-900/30 border border-red-500/40 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="brand-gradient w-full py-4 rounded-xl font-bold text-white text-lg shadow-lg active:scale-95 transition-transform disabled:opacity-50"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="text-sm text-[var(--color-text-soft)] mt-2">
          ¿No tienes cuenta?{" "}
          <Link href="/register" className="text-[var(--color-magenta)] font-semibold">
            Créala aquí
          </Link>
        </p>
      </div>
    </main>
  );
}
