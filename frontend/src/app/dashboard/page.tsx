"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles } from "lucide-react";

import { RequireAuth } from "@/components/auth/require-auth";
import { AppHeader } from "@/components/app-header";
import { CreateProjectDialog } from "@/components/projects/create-project-dialog";
import { ProjectCard } from "@/components/projects/project-card";
import { useAuth } from "@/lib/auth-context";
import { listProjects } from "@/lib/projects-api";
import { ApiError } from "@/lib/api-client";
import type { Project } from "@/lib/types";

function DashboardContent() {
  const { logout } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[] | null>(null);

  useEffect(() => {
    listProjects()
      .then(setProjects)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          logout();
          router.replace("/login");
          return;
        }
        setProjects([]); // show empty state rather than hang
      });
  }, [logout, router]);

  function handleCreated(project: Project) {
    setProjects((prev) => (prev ? [project, ...prev] : [project]));
  }

  function handleDeleted(id: string) {
    setProjects((prev) => prev?.filter((p) => p.id !== id) ?? null);
  }

  return (
    <main className="flex flex-1 flex-col">
      <AppHeader />

      <section className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold">پروژه‌ها</h1>
          <CreateProjectDialog onCreated={handleCreated} />
        </div>

        {projects === null ? (
          <div className="flex justify-center py-24">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : projects.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onDeleted={handleDeleted}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function EmptyState() {
  return (
    <div className="mt-8 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-20 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-secondary">
        <Sparkles className="size-6 text-primary" />
      </div>
      <h2 className="text-lg font-medium">اولین ریلز خود را بسازید</h2>
      <p className="max-w-sm text-sm text-muted-foreground">
        یک پروژه جدید بسازید و از ایده تا خروجی را در چند دقیقه طی کنید.
      </p>
      <div className="mt-2">
        <CreateProjectDialog />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <RequireAuth>
      <DashboardContent />
    </RequireAuth>
  );
}
