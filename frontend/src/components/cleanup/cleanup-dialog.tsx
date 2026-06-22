"use client";

import { useEffect, useState } from "react";
import { AudioLines, Check, Loader2, Wind } from "lucide-react";
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
import {
  clearCleanup,
  getCleanup,
  removeBreaths,
  removeSilence,
} from "@/lib/cleanup-api";
import type { CleanupOperation, CleanupSummary } from "@/lib/types";

function ToggleRow({
  icon,
  title,
  description,
  checked,
  onToggle,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-start transition-colors",
        checked ? "border-primary/50 bg-primary/5" : "border-border hover:bg-secondary/50",
      )}
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
        {icon}
      </span>
      <span className="flex-1">
        <span className="block text-sm font-medium">{title}</span>
        <span className="block text-xs text-muted-foreground">{description}</span>
      </span>
      <span
        className={cn(
          "flex size-5 shrink-0 items-center justify-center rounded-md border",
          checked ? "border-primary bg-primary text-primary-foreground" : "border-border",
        )}
      >
        {checked && <Check className="size-3.5" />}
      </span>
    </button>
  );
}

export function CleanupDialog({
  projectId,
  open,
  onOpenChange,
  onChange,
}: {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChange: (operations: CleanupOperation[]) => void;
}) {
  const [silence, setSilence] = useState(false);
  const [breaths, setBreaths] = useState(false);
  const [summary, setSummary] = useState<CleanupSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);

  // Load the current cleanup state whenever the dialog opens.
  useEffect(() => {
    if (!open) return;
    setLoading(true);
    getCleanup(projectId)
      .then((state) => {
        setSilence(state.summary.silence_count > 0);
        setBreaths(state.summary.breath_count > 0);
        setSummary(state.summary);
      })
      .catch(() => setSummary(null))
      .finally(() => setLoading(false));
  }, [open, projectId]);

  async function apply() {
    setApplying(true);
    try {
      // Clear, then (re)apply each selected type — handles turning options off too.
      let state = await clearCleanup(projectId);
      if (silence) state = await removeSilence(projectId);
      if (breaths) state = await removeBreaths(projectId);
      setSummary(state.summary);
      onChange(state.operations);
      const removed = state.summary.total_seconds;
      toast.success(
        removed > 0
          ? `پاک‌سازی اعمال شد — حدود ${removed.toFixed(1)} ثانیه حذف شد.`
          : "موردی برای پاک‌سازی پیدا نشد.",
      );
      onOpenChange(false);
    } catch (err) {
      toast.error(
        err instanceof ApiError && err.status === 400
          ? "ابتدا باید ویدیوی پروژه پردازش شود."
          : "اعمال پاک‌سازی ناموفق بود.",
      );
    } finally {
      setApplying(false);
    }
  }

  async function undo() {
    setApplying(true);
    try {
      const state = await clearCleanup(projectId);
      setSilence(false);
      setBreaths(false);
      setSummary(state.summary);
      onChange(state.operations);
      toast.success("پاک‌سازی برگردانده شد.");
    } catch {
      toast.error("بازگردانی ناموفق بود.");
    } finally {
      setApplying(false);
    }
  }

  const hasCleanup = (summary?.total_seconds ?? 0) > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>پاک‌سازی هوشمند</DialogTitle>
          <DialogDescription>
            سکوت‌ها و مکث‌های اضافی به‌صورت خودکار شناسایی و حذف می‌شوند. ویدیوی
            اصلی تغییر نمی‌کند.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-2">
            <ToggleRow
              icon={<AudioLines className="size-4" />}
              title="حذف سکوت‌ها"
              description="بخش‌های بی‌صدای طولانی حذف می‌شوند"
              checked={silence}
              onToggle={() => setSilence((v) => !v)}
            />
            <ToggleRow
              icon={<Wind className="size-4" />}
              title="حذف نفس‌ها و مکث‌ها"
              description="مکث‌های کوتاه بین جملات حذف می‌شوند"
              checked={breaths}
              onToggle={() => setBreaths((v) => !v)}
            />

            {summary && hasCleanup && (
              <p className="px-1 pt-1 text-xs text-muted-foreground">
                در حال حاضر حدود {summary.total_seconds.toFixed(1)} ثانیه برای حذف
                علامت‌گذاری شده ({summary.silence_count} سکوت، {summary.breath_count}{" "}
                مکث).
              </p>
            )}
          </div>
        )}

        <DialogFooter>
          {hasCleanup && (
            <Button variant="ghost" onClick={undo} disabled={applying}>
              بازگردانی
            </Button>
          )}
          <Button onClick={apply} disabled={applying || loading}>
            {applying && <Loader2 className="size-4 animate-spin" />}
            اعمال تغییرات
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
