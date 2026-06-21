"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Loader2, Upload } from "lucide-react";

import { RequireAuth } from "@/components/auth/require-auth";
import { AppHeader } from "@/components/app-header";
import { StatusBadge } from "@/components/projects/status-badge";
import { ScriptAssistant } from "@/components/scripts/script-assistant";
import { buttonVariants } from "@/components/ui/button";
import { getProject } from "@/lib/projects-api";
import { formatDate } from "@/lib/project-status";
import { ApiError } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import type { Project } from "@/lib/types";

function ProjectWorkspace() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { logout } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!params.id) return;
    getProject(params.id)
      .then(setProject)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          logout();
          router.replace("/login");
          return;
        }
        setNotFound(true);
      });
  }, [params.id, logout, router]);

  return (
    <main className="flex h-dvh flex-col overflow-hidden">
      <AppHeader />

      <section className="mx-auto flex w-full min-h-0 max-w-5xl flex-1 flex-col px-6 py-8">
        {notFound ? (
          <div className="flex flex-col items-center gap-4 py-20 text-center">
            <h1 className="text-xl font-bold">پروژه یافت نشد</h1>
            <Link href="/dashboard" className={buttonVariants({ variant: "secondary" })}>
              بازگشت به داشبورد
            </Link>
          </div>
        ) : !project ? (
          <div className="flex justify-center py-24">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col gap-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Link
                  href="/dashboard"
                  aria-label="بازگشت به داشبورد"
                  className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
                >
                  <ArrowRight className="size-4" />
                </Link>
                <div className="space-y-1">
                  <h1 className="text-2xl font-bold">{project.title}</h1>
                  <p className="text-xs text-muted-foreground">
                    ساخته‌شده در {formatDate(project.created_at)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={project.status} />
                <Link
                  href={`/projects/${project.id}/upload`}
                  className={buttonVariants({ variant: "secondary", size: "sm" })}
                >
                  <Upload className="size-4" />
                  آپلود کلیپ‌ها
                </Link>
              </div>
            </div>
            <ScriptAssistant projectId={project.id} />
          </div>
        )}
      </section>
    </main>
  );
}

export default function ProjectPage() {
  return (
    <RequireAuth>
      <ProjectWorkspace />
    </RequireAuth>
  );
}
