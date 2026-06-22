"use client";

import { cn } from "@/lib/utils";
import { subtitleHasBackground, subtitleTextStyle } from "@/lib/subtitle-style";
import type { SubtitlePreset } from "@/lib/types";

/**
 * Live subtitle preview drawn over the video frame (docs/USER_JOURNEY.md —
 * Screen 11). The parent frame must be a CSS container (`@container`) so the
 * `cqw`-based font size scales with the preview. Renders nothing when there is
 * no active caption.
 */
export function SubtitleOverlay({
  text,
  style,
}: {
  text: string | null;
  style: SubtitlePreset | null;
}) {
  if (!text || !style) return null;

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-x-0 flex justify-center px-[6%]",
        style.position === "center"
          ? "top-1/2 -translate-y-1/2"
          : "bottom-[8%]",
      )}
    >
      <span
        dir="rtl"
        className={cn(
          "max-w-full text-center leading-tight",
          subtitleHasBackground(style) && "rounded-md px-[2.5%] py-[1%]",
        )}
        style={{
          ...subtitleTextStyle(style),
          background: subtitleHasBackground(style) ? style.background : undefined,
        }}
      >
        {text}
      </span>
    </div>
  );
}
