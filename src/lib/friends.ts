"use client";

import {
  collection,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  serverTimestamp,
  onSnapshot,
  Unsubscribe,
  query,
  where,
} from "firebase/firestore";
import { db } from "./firebase";
import { normalizeUsername } from "./auth";

export type Friend = {
  uid: string;
  username: string;
  displayName: string;
};

export function friendshipId(uidA: string, uidB: string): string {
  return [uidA, uidB].sort().join("__");
}

export async function findUserByUsername(
  usernameRaw: string
): Promise<{ uid: string; username: string; displayName: string } | null> {
  const username = normalizeUsername(usernameRaw);
  if (!username) return null;
  const usernameRef = doc(db, "usernames", username);
  const snap = await getDoc(usernameRef);
  if (!snap.exists()) return null;
  const uid = snap.data().uid as string;
  const userSnap = await getDoc(doc(db, "users", uid));
  if (!userSnap.exists()) return null;
  const data = userSnap.data();
  return { uid, username, displayName: data.displayName };
}

export async function addFriend(myUid: string, friendUid: string): Promise<void> {
  if (myUid === friendUid) {
    throw new Error("No puedes agregarte a ti mismo.");
  }
  const fid = friendshipId(myUid, friendUid);
  const ref = doc(db, "friendships", fid);
  await setDoc(
    ref,
    {
      users: [myUid, friendUid].sort(),
      createdAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function removeFriend(myUid: string, friendUid: string): Promise<void> {
  const fid = friendshipId(myUid, friendUid);
  await deleteDoc(doc(db, "friendships", fid));
}

export function subscribeToFriendships(
  myUid: string,
  callback: (friendUids: string[]) => void
): Unsubscribe {
  const q = query(
    collection(db, "friendships"),
    where("users", "array-contains", myUid)
  );
  return onSnapshot(q, (snap) => {
    const uids: string[] = [];
    snap.forEach((d) => {
      const users = d.data().users as string[];
      const other = users.find((u) => u !== myUid);
      if (other) uids.push(other);
    });
    callback(uids);
  });
}

export async function loadFriendProfiles(uids: string[]): Promise<Friend[]> {
  const friends: Friend[] = [];
  await Promise.all(
    uids.map(async (uid) => {
      const snap = await getDoc(doc(db, "users", uid));
      if (snap.exists()) {
        const data = snap.data();
        friends.push({
          uid,
          username: data.username,
          displayName: data.displayName,
        });
      }
    })
  );
  return friends.sort((a, b) => a.displayName.localeCompare(b.displayName));
}
