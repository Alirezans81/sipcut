"use client";

import { useEffect, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ApiError } from "@/lib/api-client";
import { generateSubtitles } from "@/lib/subtitles-api";
import type { SubtitlePreset } from "@/lib/types";

const SAMPLE = "نمونه‌ی زیرنویس";

export function SubtitleDialog({
  projectId,
  open,
  onOpenChange,
  presets,
  currentPreset,
  onPreview,
  onApplied,
}: {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  presets: SubtitlePreset[];
  currentPreset: string | null;
  onPreview: (style: SubtitlePreset) => void;
  onApplied: (style: SubtitlePreset) => void;
}) {
  const [selected, setSelected] = useState<string>(currentPreset ?? "reels");
  const [applying, setApplying] = useState(false);

  // Sync selection to the current track each time the dialog opens, and show it.
  useEffect(() => {
    if (!open) return;
    const initial = currentPreset ?? presets[0]?.preset ?? "reels";
    setSelected(initial);
    const style = presets.find((p) => p.preset === initial);
    if (style) onPreview(style);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function pick(style: SubtitlePreset) {
    setSelected(style.preset);
    onPreview(style); // instant live preview on the video
  }

  async function apply() {
    const style = presets.find((p) => p.preset === selected);
    if (!style) return;
    setApplying(true);
    try {
      await generateSubtitles(projectId, selected);
      onApplied(style);
      toast.success("زیرنویس تولید شد.");
      onOpenChange(false);
    } catch (err) {
      toast.error(
        err instanceof ApiError && err.status === 400
          ? "ابتدا باید رونویسی پروژه انجام شود."
          : "تولید زیرنویس ناموفق بود.",
      );
    } finally {
      setApplying(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>زیرنویس</DialogTitle>
          <DialogDescription>
            یک استایل انتخاب کنید؛ پیش‌نمایش روی ویدیو به‌صورت زنده تغییر می‌کند.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-2 sm:grid-cols-3">
          {presets.map((p) => {
            const active = p.preset === selected;
            const hasBg = p.background !== "transparent";
            return (
              <button
                key={p.preset}
                type="button"
                onClick={() => pick(p)}
                className={cn(
                  "relative flex h-24 flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border bg-black/40 p-2 transition-colors",
                  active ? "border-primary" : "border-border hover:border-primary/50",
                )}
              >
                {active && (
                  <span className="absolute end-1.5 top-1.5 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Check className="size-3.5" />
                  </span>
                )}
                <span
                  dir="rtl"
                  className={cn("leading-tight", hasBg && "rounded px-1.5 py-0.5")}
                  style={{
                    fontSize: `${p.font_size * 2.4}px`,
                    fontWeight: p.font_weight,
                    color: p.text_color,
                    background: hasBg ? p.background : undefined,
                    textShadow: `0 0 2px ${p.outline_color}, 1px 1px 1px ${p.outline_color}, -1px 1px 1px ${p.outline_color}`,
                  }}
                >
                  {SAMPLE}
                </span>
                <span className="text-[11px] text-muted-foreground">{p.label}</span>
              </button>
            );
          })}
        </div>

        <DialogFooter>
          <Button onClick={apply} disabled={applying}>
            {applying && <Loader2 className="size-4 animate-spin" />}
            اعمال و تولید
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
