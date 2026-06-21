import { cn } from "@/lib/utils";
import {
  PROJECT_STATUS_META,
  STATUS_TONE_CLASSES,
} from "@/lib/project-status";
import type { ProjectStatus } from "@/lib/types";

export function StatusBadge({ status }: { status: ProjectStatus }) {
  const meta = PROJECT_STATUS_META[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        STATUS_TONE_CLASSES[meta.tone],
      )}
    >
      {meta.label}
    </span>
  );
}
