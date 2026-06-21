"use client";

import { useState } from "react";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { StatusBadge } from "./status-badge";
import { ApiError } from "@/lib/api-client";
import { deleteProject } from "@/lib/projects-api";
import { formatDate } from "@/lib/project-status";
import type { Project } from "@/lib/types";

export function ProjectCard({
  project,
  onDeleted,
}: {
  project: Project;
  onDeleted: (id: string) => void;
}) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteProject(project.id);
      toast.success("پروژه حذف شد.");
      onDeleted(project.id);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "خطا در حذف پروژه.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="group relative flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary">
      {/* Stretched link makes the whole card open the project without nesting
          interactive elements (the delete button sits above via z-index). */}
      <Link
        href={`/projects/${project.id}`}
        aria-label={project.title}
        className="absolute inset-0 rounded-2xl"
      />

      <div className="flex items-start justify-between gap-2">
        <h3 className="line-clamp-2 font-medium">{project.title}</h3>

        <AlertDialog>
          <AlertDialogTrigger
            aria-label="حذف پروژه"
            className="relative z-10 -m-1 rounded-md p-1 text-muted-foreground opacity-0 transition hover:bg-destructive/15 hover:text-destructive focus-visible:opacity-100 group-hover:opacity-100"
          >
            <Trash2 className="size-4" />
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>حذف پروژه</AlertDialogTitle>
              <AlertDialogDescription>
                «{project.title}» برای همیشه حذف می‌شود. این عمل قابل بازگشت نیست.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleting}>انصراف</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={deleting}
                className="bg-destructive text-white hover:bg-destructive/90"
              >
                حذف
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="flex items-center justify-between">
        <StatusBadge status={project.status} />
        <time className="text-xs text-muted-foreground">
          {formatDate(project.created_at)}
        </time>
      </div>
    </div>
  );
}
