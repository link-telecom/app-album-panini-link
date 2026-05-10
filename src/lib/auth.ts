"use client";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  User,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  runTransaction,
} from "firebase/firestore";
import { auth, db } from "./firebase";

const EMAIL_DOMAIN = "album.link";
const PIN_SUFFIX = "panini-album-2026";

export function normalizeUsername(raw: string): string {
  return raw.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
}

function emailFromUsername(username: string): string {
  return `${normalizeUsername(username)}@${EMAIL_DOMAIN}`;
}

function passwordFromPin(pin: string): string {
  return `${pin}-${PIN_SUFFIX}`;
}

export function isValidUsername(username: string): boolean {
  const u = normalizeUsername(username);
  return u.length >= 3 && u.length <= 20;
}

export function isValidPin(pin: string): boolean {
  return /^[0-9]{4}$/.test(pin);
}

export type RegisterInput = {
  username: string;
  pin: string;
  displayName: string;
};

export type AuthErrorCode =
  | "username_invalid"
  | "username_taken"
  | "pin_invalid"
  | "displayname_invalid"
  | "wrong_credentials"
  | "network"
  | "unknown";

export class AuthError extends Error {
  code: AuthErrorCode;
  constructor(code: AuthErrorCode, message: string) {
    super(message);
    this.code = code;
  }
}

export async function registerUser(input: RegisterInput): Promise<User> {
  const username = normalizeUsername(input.username);
  const displayName = input.displayName.trim();

  if (!isValidUsername(username)) {
    throw new AuthError(
      "username_invalid",
      "El usuario debe tener entre 3 y 20 caracteres (letras, números o _)"
    );
  }
  if (!isValidPin(input.pin)) {
    throw new AuthError("pin_invalid", "El PIN debe ser de 4 dígitos");
  }
  if (displayName.length < 2 || displayName.length > 30) {
    throw new AuthError(
      "displayname_invalid",
      "El nombre debe tener entre 2 y 30 caracteres"
    );
  }

  const usernameRef = doc(db, "usernames", username);
  const existing = await getDoc(usernameRef);
  if (existing.exists()) {
    throw new AuthError("username_taken", "Ese nombre de usuario ya está tomado");
  }

  let user: User;
  try {
    const cred = await createUserWithEmailAndPassword(
      auth,
      emailFromUsername(username),
      passwordFromPin(input.pin)
    );
    user = cred.user;
  } catch (err: unknown) {
    const code = (err as { code?: string })?.code;
    if (code === "auth/email-already-in-use") {
      throw new AuthError("username_taken", "Ese nombre de usuario ya está tomado");
    }
    throw new AuthError("unknown", "No se pudo crear la cuenta. Intenta de nuevo.");
  }

  await runTransaction(db, async (tx) => {
    tx.set(doc(db, "usernames", username), {
      uid: user.uid,
      createdAt: serverTimestamp(),
    });
    tx.set(doc(db, "users", user.uid), {
      username,
      displayName,
      createdAt: serverTimestamp(),
    });
  });

  return user;
}

export async function loginUser(usernameRaw: string, pin: string): Promise<User> {
  const username = normalizeUsername(usernameRaw);

  if (!isValidUsername(username)) {
    throw new AuthError("username_invalid", "Usuario inválido");
  }
  if (!isValidPin(pin)) {
    throw new AuthError("pin_invalid", "PIN inválido");
  }

  try {
    const cred = await signInWithEmailAndPassword(
      auth,
      emailFromUsername(username),
      passwordFromPin(pin)
    );
    return cred.user;
  } catch {
    throw new AuthError("wrong_credentials", "Usuario o PIN incorrectos");
  }
}

export async function signOut(): Promise<void> {
  await fbSignOut(auth);
}

export type UserProfile = {
  uid: string;
  username: string;
  displayName: string;
};

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    uid,
    username: data.username,
    displayName: data.displayName,
  };
}
