"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { RequireAuth } from "@/components/auth/require-auth";
import { AppHeader } from "@/components/app-header";
import { UploadDropzone } from "@/components/videos/upload-dropzone";
import { CameraRecorder } from "@/components/videos/camera-recorder";
import { ClipList } from "@/components/videos/clip-list";
import { Button, buttonVariants } from "@/components/ui/button";
import { ApiError } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { readVideoDuration } from "@/lib/media";
import {
  deleteVideo,
  listVideos,
  renameVideo,
  reorderVideos,
  uploadVideo,
} from "@/lib/videos-api";
import { startProcessing } from "@/lib/processing-api";
import type { Video } from "@/lib/types";

function UploadWorkspace() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { logout } = useAuth();
  const projectId = params.id;

  const [videos, setVideos] = useState<Video[] | null>(null);
  const [uploading, setUploading] = useState(0);
  const [starting, setStarting] = useState(false);

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
    listVideos(projectId)
      .then(setVideos)
      .catch((err) => {
        if (!bounceTo401(err)) setVideos([]);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  async function handleFiles(files: File[]) {
    setUploading((c) => c + files.length);
    for (const file of files) {
      try {
        const duration = await readVideoDuration(file);
        const video = await uploadVideo(projectId, file, { duration });
        setVideos((prev) => [...(prev ?? []), video]);
      } catch (err) {
        if (!bounceTo401(err)) {
          toast.error(
            err instanceof ApiError ? err.message : `آپلود «${file.name}» ناموفق بود.`,
          );
        }
      } finally {
        setUploading((c) => c - 1);
      }
    }
  }

  async function handleRecorded(blob: Blob, duration: number) {
    setUploading((c) => c + 1);
    try {
      const video = await uploadVideo(projectId, blob, {
        name: "ضبط دوربین",
        duration,
      });
      setVideos((prev) => [...(prev ?? []), video]);
      toast.success("ضبط اضافه شد.");
    } catch (err) {
      if (!bounceTo401(err)) toast.error("ذخیره ضبط ناموفق بود.");
    } finally {
      setUploading((c) => c - 1);
    }
  }

  async function handleReorder(next: Video[]) {
    const prev = videos;
    setVideos(next); // optimistic
    try {
      const updated = await reorderVideos(projectId, next.map((v) => v.id));
      setVideos(updated);
    } catch (err) {
      setVideos(prev);
      if (!bounceTo401(err)) toast.error("تغییر ترتیب ذخیره نشد.");
    }
  }

  async function handleRename(id: string, name: string) {
    const prev = videos;
    setVideos((vs) => vs?.map((v) => (v.id === id ? { ...v, name } : v)) ?? null);
    try {
      await renameVideo(projectId, id, name);
    } catch (err) {
      setVideos(prev);
      if (!bounceTo401(err)) toast.error("تغییر نام ذخیره نشد.");
    }
  }

  async function handleDelete(id: string) {
    const prev = videos;
    setVideos((vs) => vs?.filter((v) => v.id !== id) ?? null);
    try {
      await deleteVideo(projectId, id);
    } catch (err) {
      setVideos(prev);
      if (!bounceTo401(err)) toast.error("حذف کلیپ ناموفق بود.");
    }
  }

  async function handleContinue() {
    setStarting(true);
    try {
      await startProcessing(projectId);
      router.push(`/projects/${projectId}/processing`);
    } catch (err) {
      setStarting(false);
      if (!bounceTo401(err)) {
        toast.error(
          err instanceof ApiError && err.status === 400
            ? "برای ادامه حداقل یک کلیپ لازم است."
            : "شروع پردازش ناموفق بود.",
        );
      }
    }
  }

  const clipCount = videos?.length ?? 0;

  return (
    <main className="flex flex-1 flex-col">
      <AppHeader />

      <section className="mx-auto w-full max-w-3xl flex-1 px-6 py-8">
        <div className="flex items-center gap-3">
          <Link
            href={`/projects/${projectId}`}
            aria-label="بازگشت"
            className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
          >
            <ArrowRight className="size-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">آپلود کلیپ‌ها</h1>
            <p className="text-xs text-muted-foreground">
              کلیپ‌ها را اضافه و مرتب کنید؛ بعداً به یک ویدیو ادغام می‌شوند.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <UploadDropzone onFiles={handleFiles} disabled={uploading > 0} />
          <CameraRecorder onRecorded={handleRecorded} />
        </div>

        <div className="mt-8">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-medium text-muted-foreground">
              کلیپ‌ها {clipCount > 0 && `(${clipCount})`}
            </h2>
            {uploading > 0 && (
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Loader2 className="size-3.5 animate-spin" />
                در حال آپلود {uploading} فایل
              </span>
            )}
          </div>

          {videos === null ? (
            <div className="flex justify-center py-16">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : videos.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
              هنوز کلیپی اضافه نشده. اولین ویدیو خود را آپلود یا ضبط کنید.
            </p>
          ) : (
            <ClipList
              videos={videos}
              onReorder={handleReorder}
              onRename={handleRename}
              onDelete={handleDelete}
            />
          )}
        </div>

        <div className="mt-8 flex justify-end">
          <Button
            className="w-full md:w-auto"
            disabled={clipCount === 0 || uploading > 0 || starting}
            onClick={handleContinue}
          >
            {starting && <Loader2 className="size-4 animate-spin" />}
            ادامه و پردازش
          </Button>
        </div>
      </section>
    </main>
  );
}

export default function UploadPage() {
  return (
    <RequireAuth>
      <UploadWorkspace />
    </RequireAuth>
  );
}
