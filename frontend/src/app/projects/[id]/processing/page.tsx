"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Check, Loader2, TriangleAlert } from "lucide-react";

import { RequireAuth } from "@/components/auth/require-auth";
import { AppHeader } from "@/components/app-header";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ApiError } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { getProcessing } from "@/lib/processing-api";
import type { ProcessingState } from "@/lib/types";

type StepState = "pending" | "active" | "done";

/** Derive per-step status from the project status + what the timeline contains. */
function stepStates(state: ProcessingState | null): StepState[] {
  if (!state) return ["active", "pending", "pending"];
  const ready = state.status === "READY_FOR_EDITING";
  const hasSource = !!state.timeline.source_video;
  const hasSegments = state.timeline.segments.length > 0;

  // Steps: merge clips, generate transcript, prepare timeline.
  if (ready) return ["done", "done", "done"];
  return [
    hasSource ? "done" : "active",
    hasSource ? (hasSegments ? "done" : "active") : "pending",
    "pending",
  ];
}

const STEP_LABELS = [
  "ادغام کلیپ‌ها",
  "تولید متن گفتار",
  "آماده‌سازی تایم‌لاین",
];

const POLL_MS = 2000;

function ProcessingScreen() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { logout } = useAuth();
  const projectId = params.id;

  const [state, setState] = useState<ProcessingState | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!projectId) return;
    let active = true;
    let timer: ReturnType<typeof setTimeout>;

    const poll = async () => {
      try {
        const next = await getProcessing(projectId);
        if (!active) return;
        setState(next);

        if (next.status === "READY_FOR_EDITING") {
          router.replace(`/projects/${projectId}`);
          return;
        }
        if (next.status.startsWith("FAILED")) {
          setFailed(true);
          return;
        }
        timer = setTimeout(poll, POLL_MS);
      } catch (err) {
        if (!active) return;
        if (err instanceof ApiError && err.status === 401) {
          logout();
          router.replace("/login");
          return;
        }
        timer = setTimeout(poll, POLL_MS);
      }
    };

    poll();
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [projectId, router, logout]);

  const steps = stepStates(state);

  return (
    <main className="flex flex-1 flex-col">
      <AppHeader />

      <section className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-6 py-16 text-center">
        {failed ? (
          <>
            <span className="flex size-14 items-center justify-center rounded-full bg-destructive/15">
              <TriangleAlert className="size-7 text-destructive" />
            </span>
            <h1 className="mt-5 text-xl font-bold">پردازش با خطا مواجه شد</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              مشکلی در آماده‌سازی پروژه پیش آمد. دوباره تلاش کنید.
            </p>
            <Link
              href={`/projects/${projectId}/upload`}
              className={cn(buttonVariants({ variant: "secondary" }), "mt-6")}
            >
              بازگشت به آپلود
            </Link>
          </>
        ) : (
          <>
            <Loader2 className="size-9 animate-spin text-primary" />
            <h1 className="mt-5 text-xl font-bold">در حال آماده‌سازی پروژه</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              این کار ممکن است کمی طول بکشد؛ صفحه را نبندید.
            </p>

            <ol className="mt-8 w-full space-y-3 text-start">
              {STEP_LABELS.map((label, i) => (
                <li
                  key={label}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border border-border px-4 py-3 text-sm transition-colors",
                    steps[i] === "active" && "border-primary/50 bg-primary/5",
                    steps[i] === "pending" && "opacity-50",
                  )}
                >
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-secondary">
                    {steps[i] === "done" ? (
                      <Check className="size-3.5 text-success" />
                    ) : steps[i] === "active" ? (
                      <Loader2 className="size-3.5 animate-spin text-primary" />
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        {i + 1}
                      </span>
                    )}
                  </span>
                  {label}
                </li>
              ))}
            </ol>
          </>
        )}
      </section>
    </main>
  );
}

export default function ProcessingPage() {
  return (
    <RequireAuth>
      <ProcessingScreen />
    </RequireAuth>
  );
}
