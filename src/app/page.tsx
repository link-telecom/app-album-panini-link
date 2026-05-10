"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Image from "next/image";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.replace("/album");
      } else {
        setLoading(false);
      }
    });
    return () => unsub();
  }, [router]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-[var(--color-text-soft)]">Cargando...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm flex flex-col items-center gap-8">
        <div className="bg-[#f8f5e6] rounded-2xl p-6 shadow-2xl">
          <Image
            src="/logo.jpeg"
            alt="Link Telecomunicaciones"
            width={200}
            height={200}
            priority
            className="block"
          />
        </div>

        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">
            App Álbum Panini
          </h1>
          <p className="text-[var(--color-text-soft)] text-base">
            Mundial 2026 · Sincroniza tu álbum con tus amigos
          </p>
        </div>

        <div className="w-full flex flex-col gap-3 mt-4">
          <button
            onClick={() => router.push("/login")}
            className="brand-gradient w-full py-4 rounded-xl font-bold text-white text-lg shadow-lg active:scale-95 transition-transform"
          >
            Entrar
          </button>
          <button
            onClick={() => router.push("/register")}
            className="w-full py-4 rounded-xl font-bold text-white text-lg border-2 border-[var(--color-magenta)] active:scale-95 transition-transform"
          >
            Crear cuenta
          </button>
        </div>

        <p className="text-xs text-[var(--color-text-soft)] mt-8 text-center">
          Hecho con cariño para coleccionistas
        </p>
      </div>
    </main>
  );
}
