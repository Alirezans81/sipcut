"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";

import { RequireAuth } from "@/components/auth/require-auth";
import { AppHeader } from "@/components/app-header";
import { StatusBadge } from "@/components/projects/status-badge";
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
    <main className="flex flex-1 flex-col">
      <AppHeader />

      <section className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
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
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h1 className="text-2xl font-bold">{project.title}</h1>
              <StatusBadge status={project.status} />
            </div>
            <p className="text-sm text-muted-foreground">
              ساخته‌شده در {formatDate(project.created_at)}
            </p>
            <div className="rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground">
              دستیار اسکریپت، آپلود و ویرایش در مراحل بعدی اضافه می‌شوند.
            </div>
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
