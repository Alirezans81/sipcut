"use client";

import { RotateCcw, Trash2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatDuration } from "@/lib/media";
import type { TranscriptSegment } from "@/lib/types";

/**
 * The transcript-as-editor (docs/USER_JOURNEY.md — Screen 7). Each segment is a
 * line of text tied to a span of the source video. Deleting a line removes the
 * matching video segment at export time; here it's shown struck through and is
 * skipped during preview playback.
 */
export function TranscriptEditor({
  segments,
  activeId,
  onSeek,
  onToggleDelete,
  onEditText,
}: {
  segments: TranscriptSegment[];
  activeId: string | null;
  onSeek: (segment: TranscriptSegment) => void;
  onToggleDelete: (id: string) => void;
  onEditText: (id: string, text: string) => void;
}) {
  return (
    <ol className="space-y-2">
      {segments.map((seg) => {
        const active = seg.id === activeId && !seg.deleted;
        return (
          <li
            key={seg.id}
            className={cn(
              "group flex items-start gap-2 rounded-xl border border-transparent px-2 py-1.5 transition-colors",
              active && "border-primary/40 bg-primary/5",
              seg.deleted && "opacity-55",
            )}
          >
            <button
              type="button"
              onClick={() => onSeek(seg)}
              className="mt-1 shrink-0 rounded-md bg-secondary px-1.5 py-0.5 font-eng text-[11px] tabular-nums text-muted-foreground transition-colors hover:text-foreground"
              aria-label="پخش از این قسمت"
            >
              {formatDuration(seg.start_time)}
            </button>

            <textarea
              defaultValue={seg.text}
              readOnly={seg.deleted}
              rows={1}
              onBlur={(e) => {
                if (!seg.deleted && e.target.value !== seg.text) {
                  onEditText(seg.id, e.target.value);
                }
              }}
              className={cn(
                "field-sizing-content min-h-8 flex-1 resize-none rounded-md bg-transparent px-2 py-1 text-sm leading-7 outline-none focus:bg-secondary/50",
                seg.deleted && "line-through",
              )}
            />

            <button
              type="button"
              onClick={() => onToggleDelete(seg.id)}
              className="mt-1 shrink-0 rounded-md p-1.5 text-muted-foreground opacity-0 transition-colors hover:bg-secondary hover:text-foreground focus-visible:opacity-100 group-hover:opacity-100"
              aria-label={seg.deleted ? "بازگردانی" : "حذف"}
            >
              {seg.deleted ? (
                <RotateCcw className="size-4" />
              ) : (
                <Trash2 className="size-4" />
              )}
            </button>
          </li>
        );
      })}
    </ol>
  );
}
