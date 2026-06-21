/** Presentation helpers for the project status state machine (docs/ARCHITECTURE.md). */
import type { ProjectStatus } from "./types";

type Tone = "neutral" | "progress" | "success" | "error";

interface StatusMeta {
  label: string; // Persian label shown to users
  tone: Tone;
}

export const PROJECT_STATUS_META: Record<ProjectStatus, StatusMeta> = {
  DRAFT: { label: "پیش‌نویس", tone: "neutral" },
  UPLOADING: { label: "در حال آپلود", tone: "progress" },
  PROCESSING: { label: "در حال پردازش", tone: "progress" },
  READY_FOR_EDITING: { label: "آماده ویرایش", tone: "success" },
  EXPORTING: { label: "در حال خروجی", tone: "progress" },
  COMPLETED: { label: "تکمیل شده", tone: "success" },
  FAILED_UPLOAD: { label: "خطا در آپلود", tone: "error" },
  FAILED_TRANSCRIPT: { label: "خطا در رونویسی", tone: "error" },
  FAILED_EXPORT: { label: "خطا در خروجی", tone: "error" },
};

/** Tailwind classes per tone, using the design system's status colors (docs/UI.md). */
export const STATUS_TONE_CLASSES: Record<Tone, string> = {
  neutral: "bg-muted text-muted-foreground",
  progress: "bg-info/15 text-info",
  success: "bg-success/15 text-success",
  error: "bg-destructive/15 text-destructive",
};

/** Format an ISO date for display in Persian (Jalali) calendar. */
export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(iso));
}
