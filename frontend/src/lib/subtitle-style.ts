/** Map a subtitle preset to inline CSS, shared by the preview overlay and the
 * style picker. Font size uses `cqw` so captions scale with the 9:16 frame. */
import type { CSSProperties } from "react";
import type { SubtitlePreset } from "./types";

export function subtitleTextStyle(style: SubtitlePreset): CSSProperties {
  const o = style.outline_color;
  return {
    fontSize: `${style.font_size}cqw`,
    fontWeight: style.font_weight,
    color: style.text_color,
    // 4-directional outline so captions stay legible over any footage.
    textShadow: `0 0 2px ${o}, 1px 1px 1px ${o}, -1px 1px 1px ${o}, 1px -1px 1px ${o}, -1px -1px 1px ${o}`,
  };
}

export function subtitleHasBackground(style: SubtitlePreset): boolean {
  return style.background !== "transparent";
}
