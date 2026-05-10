"use client";

import {
  collection,
  doc,
  setDoc,
  serverTimestamp,
  onSnapshot,
  Unsubscribe,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "./firebase";

export type StickerCountMap = Record<string, number>;

export type StickerStatus = "missing" | "owned" | "duplicate";

export function statusFromCount(count: number | undefined): StickerStatus {
  if (!count || count <= 0) return "missing";
  if (count === 1) return "owned";
  return "duplicate";
}

export async function setStickerCount(
  uid: string,
  stickerCode: string,
  count: number
): Promise<void> {
  const ref = doc(db, "users", uid, "stickers", stickerCode);
  await setDoc(
    ref,
    {
      count: Math.max(0, count),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export function subscribeToUserStickers(
  uid: string,
  callback: (counts: StickerCountMap) => void
): Unsubscribe {
  const ref = collection(db, "users", uid, "stickers");
  return onSnapshot(ref, (snap) => {
    const map: StickerCountMap = {};
    snap.forEach((d) => {
      const data = d.data();
      if (typeof data.count === "number" && data.count > 0) {
        map[d.id] = data.count;
      }
    });
    callback(map);
  });
}

export async function getUserStickersOnce(uid: string): Promise<StickerCountMap> {
  const ref = collection(db, "users", uid, "stickers");
  const snap = await getDocs(query(ref, where("count", ">", 0)));
  const map: StickerCountMap = {};
  snap.forEach((d) => {
    const data = d.data();
    if (typeof data.count === "number") {
      map[d.id] = data.count;
    }
  });
  return map;
}

export function summarize(counts: StickerCountMap, totalStickers: number) {
  const owned = Object.values(counts).filter((c) => c > 0).length;
  const duplicates = Object.values(counts).reduce(
    (sum, c) => sum + Math.max(0, c - 1),
    0
  );
  const missing = totalStickers - owned;
  const percent = totalStickers > 0 ? (owned / totalStickers) * 100 : 0;
  return { owned, duplicates, missing, percent };
}
