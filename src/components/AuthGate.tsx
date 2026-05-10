"use client";

import { useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";

type Props = {
  children: (user: User) => ReactNode;
};

export function AuthGate({ children }: Props) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) {
        router.replace("/login");
      } else {
        setUser(u);
        setLoading(false);
      }
    });
    return () => unsub();
  }, [router]);

  if (loading || !user) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-[var(--color-text-soft)]">Cargando...</div>
      </main>
    );
  }

  return <>{children(user)}</>;
}
