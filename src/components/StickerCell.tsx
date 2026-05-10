"use client";

import { Sticker } from "@/lib/catalog";
import { statusFromCount } from "@/lib/stickers";

type Props = {
  sticker: Sticker;
  count: number;
  onTap: () => void;
  onLongPress: () => void;
};

export function StickerCell({ sticker, count, onTap, onLongPress }: Props) {
  const status = statusFromCount(count);

  let pressTimer: ReturnType<typeof setTimeout> | null = null;
  let isLongPress = false;

  function start() {
    isLongPress = false;
    pressTimer = setTimeout(() => {
      isLongPress = true;
      onLongPress();
      if (navigator.vibrate) navigator.vibrate(20);
    }, 400);
  }

  function clear() {
    if (pressTimer) {
      clearTimeout(pressTimer);
      pressTimer = null;
    }
  }

  function handleClick() {
    if (!isLongPress) onTap();
  }

  const bgClass =
    status === "owned"
      ? "brand-gradient text-white border-transparent"
      : status === "duplicate"
        ? "bg-[var(--color-gold)] text-[#1a0d2e] border-transparent"
        : "bg-[var(--color-bg-soft)] text-[var(--color-text-soft)] border-[var(--color-purple)]/40";

  return (
    <button
      onClick={handleClick}
      onPointerDown={start}
      onPointerUp={clear}
      onPointerLeave={clear}
      onPointerCancel={clear}
      onContextMenu={(e) => e.preventDefault()}
      className={`relative aspect-square rounded-lg border-2 flex flex-col items-center justify-center text-center p-1 font-bold transition-all active:scale-95 select-none ${bgClass}`}
    >
      <span className="text-[10px] leading-tight opacity-80">{sticker.code}</span>
      {sticker.flag && <span className="text-lg leading-none my-0.5">{sticker.flag}</span>}
      {status === "duplicate" && count > 1 && (
        <span className="absolute top-0.5 right-0.5 bg-[#1a0d2e] text-[var(--color-gold)] rounded-full min-w-[18px] h-[18px] flex items-center justify-center text-[10px] px-1">
          +{count - 1}
        </span>
      )}
    </button>
  );
}
