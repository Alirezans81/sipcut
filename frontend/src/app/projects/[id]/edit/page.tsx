"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Loader2, Redo2, Undo2 } from "lucide-react";
import { toast } from "sonner";

import { RequireAuth } from "@/components/auth/require-auth";
import { AppHeader } from "@/components/app-header";
import { TranscriptEditor } from "@/components/transcripts/transcript-editor";
import { Timeline } from "@/components/transcripts/timeline";
import { Button, buttonVariants } from "@/components/ui/button";
import { ApiError } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { getProcessing } from "@/lib/processing-api";
import { updateTranscript } from "@/lib/transcript-api";
import type { TranscriptSegment } from "@/lib/types";

interface History {
  stack: TranscriptSegment[][];
  cursor: number;
}

function EditorWorkspace() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { logout } = useAuth();
  const projectId = params.id;

  const videoRef = useRef<HTMLVideoElement>(null);
  const saveSeq = useRef(0);

  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [hist, setHist] = useState<History>({ stack: [], cursor: -1 });
  const [activeId, setActiveId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [state, setState] = useState<"loading" | "ready" | "unavailable">(
    "loading",
  );

  const segments = hist.stack[hist.cursor] ?? [];
  const canUndo = hist.cursor > 0;
  const canRedo = hist.cursor < hist.stack.length - 1;
  const deletedCount = segments.filter((s) => s.deleted).length;

  const bounceTo401 = (err: unknown) => {
    if (err instanceof ApiError && err.status === 401) {
      logout();
      router.replace("/login");
      return true;
    }
    return false;
  };

  useEffect(() => {
    if (!projectId) return;
    getProcessing(projectId)
      .then((res) => {
        if (res.status === "PROCESSING" || res.status === "UPLOADING") {
          router.replace(`/projects/${projectId}/processing`);
          return;
        }
        if (!res.timeline.source_video || res.timeline.segments.length === 0) {
          setState("unavailable");
          return;
        }
        setVideoUrl(res.timeline.source_video.url);
        setDuration(res.timeline.source_video.duration);
        setHist({ stack: [res.timeline.segments], cursor: 0 });
        setState("ready");
      })
      .catch((err) => {
        if (!bounceTo401(err)) setState("unavailable");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  async function persist(next: TranscriptSegment[]) {
    const mine = ++saveSeq.current;
    setSaving(true);
    try {
      await updateTranscript(
        projectId,
        next.map((s) => ({ id: s.id, text: s.text, deleted: s.deleted })),
      );
    } catch (err) {
      if (!bounceTo401(err)) toast.error("ذخیره تغییرات ناموفق بود.");
    } finally {
      if (saveSeq.current === mine) setSaving(false);
    }
  }

  function commit(next: TranscriptSegment[]) {
    setHist((h) => ({
      stack: [...h.stack.slice(0, h.cursor + 1), next],
      cursor: h.cursor + 1,
    }));
    persist(next);
  }

  function toggleDelete(id: string) {
    commit(
      segments.map((s) => (s.id === id ? { ...s, deleted: !s.deleted } : s)),
    );
  }

  function editText(id: string, text: string) {
    commit(segments.map((s) => (s.id === id ? { ...s, text } : s)));
  }

  function undo() {
    if (!canUndo) return;
    const cursor = hist.cursor - 1;
    setHist((h) => ({ ...h, cursor }));
    persist(hist.stack[cursor]);
  }

  function redo() {
    if (!canRedo) return;
    const cursor = hist.cursor + 1;
    setHist((h) => ({ ...h, cursor }));
    persist(hist.stack[cursor]);
  }

  function seek(seg: TranscriptSegment) {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = seg.start_time;
    setCurrentTime(seg.start_time);
    v.play().catch(() => {});
  }

  // Seek from the timeline (raw seconds), without auto-playing.
  function seekTo(time: number) {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = time;
    setCurrentTime(time);
  }

  // Skip deleted spans during playback and highlight the active segment, so the
  // preview reflects the transcript edits without re-encoding the source video.
  function onTimeUpdate() {
    const v = videoRef.current;
    if (!v) return;
    const t = v.currentTime;

    const inDeleted = segments.find(
      (s) => s.deleted && t >= s.start_time && t < s.end_time,
    );
    if (inDeleted) {
      const next = segments
        .filter((s) => !s.deleted && s.start_time >= inDeleted.end_time)
        .sort((a, b) => a.start_time - b.start_time)[0];
      v.currentTime = next ? next.start_time : v.duration;
      setCurrentTime(v.currentTime);
      return;
    }

    setCurrentTime(t);
    const active = segments.find((s) => t >= s.start_time && t < s.end_time);
    setActiveId(active ? active.id : null);
  }

  return (
    <main className="flex h-dvh flex-col overflow-hidden">
      <AppHeader />

      <section className="mx-auto flex w-full min-h-0 max-w-5xl flex-1 flex-col gap-4 px-6 py-6">
        {state === "loading" ? (
          <div className="flex flex-1 items-center justify-center">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : state === "unavailable" ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <h1 className="text-xl font-bold">هنوز چیزی برای ویرایش نیست</h1>
            <p className="text-sm text-muted-foreground">
              ابتدا کلیپ‌ها را آپلود و پردازش کنید.
            </p>
            <Link
              href={`/projects/${projectId}/upload`}
              className={buttonVariants({ variant: "secondary" })}
            >
              رفتن به آپلود
            </Link>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Link
                  href={`/projects/${projectId}`}
                  aria-label="بازگشت به پروژه"
                  className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
                >
                  <ArrowRight className="size-4" />
                </Link>
                <div>
                  <h1 className="text-xl font-bold">ویرایشگر متن</h1>
                  <p className="text-xs text-muted-foreground">
                    با ویرایش متن، ویدیو را تدوین کنید
                    {deletedCount > 0 && ` — ${deletedCount} قسمت حذف‌شده`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {saving && (
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Loader2 className="size-3.5 animate-spin" />
                    ذخیره
                  </span>
                )}
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={undo}
                  disabled={!canUndo}
                  aria-label="بازگردانی"
                >
                  <Undo2 className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={redo}
                  disabled={!canRedo}
                  aria-label="انجام مجدد"
                >
                  <Redo2 className="size-4" />
                </Button>
              </div>
            </div>

            <div className="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row">
              {/* 9:16 preview — narrow vertical frame beside the transcript. */}
              <div className="mx-auto aspect-9/16 max-h-[42dvh] shrink-0 overflow-hidden rounded-2xl border border-border bg-black lg:mx-0 lg:h-full lg:max-h-none">
                <video
                  ref={videoRef}
                  src={videoUrl ?? undefined}
                  controls
                  playsInline
                  onTimeUpdate={onTimeUpdate}
                  onLoadedMetadata={(e) => {
                    const d = e.currentTarget.duration;
                    if (Number.isFinite(d) && d > 0) setDuration(d);
                  }}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto rounded-2xl border border-border bg-card/40 p-3">
                <TranscriptEditor
                  segments={segments}
                  activeId={activeId}
                  onSeek={seek}
                  onToggleDelete={toggleDelete}
                  onEditText={editText}
                />
              </div>
            </div>

            <div className="shrink-0">
              <Timeline
                segments={segments}
                duration={duration}
                currentTime={currentTime}
                onSeek={seekTo}
              />
            </div>
          </>
        )}
      </section>
    </main>
  );
}

export default function EditorPage() {
  return (
    <RequireAuth>
      <EditorWorkspace />
    </RequireAuth>
  );
}
