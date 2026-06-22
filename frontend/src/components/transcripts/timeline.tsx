"use client";

import { cn } from "@/lib/utils";
import { formatDuration } from "@/lib/media";
import type { CleanupOperation, TranscriptSegment } from "@/lib/types";

/**
 * Visual-feedback timeline (docs/USER_JOURNEY.md — Timeline). Not a professional
 * editor: it just shows the source video as a track with the playhead, cut
 * (deleted) sections, and the regions where subtitles will appear, plus
 * click-to-seek. Time flows left→right (forced LTR) regardless of the RTL page.
 */
export function Timeline({
  segments,
  cleanup = [],
  duration,
  currentTime,
  onSeek,
}: {
  segments: TranscriptSegment[];
  cleanup?: CleanupOperation[];
  duration: number;
  currentTime: number;
  onSeek: (time: number) => void;
}) {
  const pct = (value: number) =>
    duration > 0 ? `${Math.min(100, Math.max(0, (value / duration) * 100))}%` : "0%";

  function handleSeek(e: React.MouseEvent<HTMLDivElement>) {
    if (duration <= 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    onSeek(Math.min(duration, Math.max(0, ratio * duration)));
  }

  const subtitleRegions = segments.filter((s) => !s.deleted && s.text.trim());

  return (
    <div dir="ltr" className="select-none space-y-1.5">
      {/* Main track: video segments with cut indicators + playhead. */}
      <div
        role="slider"
        aria-label="تایم‌لاین"
        aria-valuemin={0}
        aria-valuemax={Math.round(duration)}
        aria-valuenow={Math.round(currentTime)}
        tabIndex={0}
        onClick={handleSeek}
        className="relative h-10 w-full cursor-pointer overflow-hidden rounded-lg bg-secondary"
      >
        {segments.map((seg) => {
          const active =
            currentTime >= seg.start_time && currentTime < seg.end_time;
          return (
            <div
              key={seg.id}
              className={cn(
                "absolute inset-y-1 rounded-sm border",
                seg.deleted
                  ? "border-destructive/50 bg-destructive/25"
                  : active
                    ? "border-primary/60 bg-primary/35"
                    : "border-primary/25 bg-primary/15",
              )}
              style={{
                left: pct(seg.start_time),
                width: pct(seg.end_time - seg.start_time),
                // Diagonal hatch marks deleted/cut spans (theme-independent).
                backgroundImage: seg.deleted
                  ? "repeating-linear-gradient(45deg, rgba(255,255,255,0.14) 0 3px, transparent 3px 7px)"
                  : undefined,
              }}
              title={seg.deleted ? "حذف‌شده" : seg.text}
            />
          );
        })}

        {/* Auto-cleanup cuts (silences / breaths) — thin markers over the track. */}
        {cleanup.map((op) => (
          <div
            key={op.id}
            className="pointer-events-none absolute inset-y-0 z-5 border-x border-warning/60 bg-warning/30"
            style={{ left: pct(op.start_time), width: pct(op.end_time - op.start_time) }}
            title={op.type === "silence" ? "سکوت حذف‌شده" : "مکث حذف‌شده"}
          />
        ))}

        {/* Playhead */}
        <div
          className="pointer-events-none absolute inset-y-0 z-10 w-0.5 -translate-x-1/2 bg-foreground"
          style={{ left: pct(currentTime) }}
        >
          <div className="absolute -top-px left-1/2 size-2 -translate-x-1/2 rounded-full bg-foreground" />
        </div>
      </div>

      {/* Subtitle regions: where captions will be burned (kept, spoken segments). */}
      <div className="relative h-1.5 w-full rounded bg-secondary/50" title="نواحی زیرنویس">
        {subtitleRegions.map((seg) => (
          <div
            key={seg.id}
            className="absolute inset-y-0 rounded-full bg-info/70"
            style={{ left: pct(seg.start_time), width: pct(seg.end_time - seg.start_time) }}
          />
        ))}
      </div>

      {/* Time readout + legend */}
      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        <span className="font-eng tabular-nums">
          {formatDuration(currentTime)} / {formatDuration(duration)}
        </span>
        <span className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="size-2 rounded-sm bg-primary/40" />
            ویدیو
          </span>
          <span className="flex items-center gap-1">
            <span className="size-2 rounded-sm border border-destructive/50 bg-destructive/20" />
            حذف‌شده
          </span>
          {cleanup.length > 0 && (
            <span className="flex items-center gap-1">
              <span className="size-2 rounded-sm border border-warning/60 bg-warning/30" />
              پاک‌سازی
            </span>
          )}
          <span className="flex items-center gap-1">
            <span className="size-2 rounded-full bg-info/70" />
            زیرنویس
          </span>
        </span>
      </div>
    </div>
  );
}
