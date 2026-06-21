"use client";

import { useEffect, useRef, useState } from "react";
import { Circle, Loader2, Square, Video as VideoIcon } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { readVideoDuration } from "@/lib/media";

function pickMimeType(): string | undefined {
  const candidates = [
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm",
    "video/mp4",
  ];
  return candidates.find(
    (t) => typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(t),
  );
}

export function CameraRecorder({
  onRecorded,
}: {
  onRecorded: (blob: Blob, duration: number) => Promise<void> | void;
}) {
  const [open, setOpen] = useState(false);
  const [recording, setRecording] = useState(false);
  const [saving, setSaving] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Acquire/release the camera with the dialog's lifecycle.
  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "user" }, audio: true })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch(() => {
        toast.error("دسترسی به دوربین ممکن نشد.");
        setOpen(false);
      });

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, [open]);

  function startRecording() {
    if (!streamRef.current) return;
    chunksRef.current = [];
    const recorder = new MediaRecorder(streamRef.current, { mimeType: pickMimeType() });
    recorder.ondataavailable = (e) => {
      if (e.data.size) chunksRef.current.push(e.data);
    };
    recorder.onstop = handleStop;
    recorder.start();
    recorderRef.current = recorder;
    setRecording(true);
  }

  function stopRecording() {
    recorderRef.current?.stop();
    setRecording(false);
  }

  async function handleStop() {
    const type = chunksRef.current[0]?.type || "video/webm";
    const blob = new Blob(chunksRef.current, { type });
    setSaving(true);
    try {
      const duration = await readVideoDuration(blob);
      await onRecorded(blob, duration);
      setOpen(false);
    } catch {
      toast.error("ذخیره ضبط ناموفق بود.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (recording || saving) return; // don't close mid-action
        setOpen(next);
      }}
    >
      <DialogTrigger className="flex size-full cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border p-8 text-center transition-colors hover:border-primary/60">
        <span className="flex size-11 items-center justify-center rounded-full bg-secondary">
          <VideoIcon className="size-5 text-primary" />
        </span>
        <p className="text-sm font-medium">ضبط ویدیو با دوربین</p>
        <p className="text-xs text-muted-foreground">مستقیماً از دوربین دستگاه</p>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>ضبط ویدیو</DialogTitle>
          <DialogDescription>
            با دوربین دستگاه خود مستقیماً ضبط کنید؛ ویدیو به لیست کلیپ‌ها اضافه می‌شود.
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-hidden rounded-xl bg-black">
          {/* Mirror the preview like a selfie camera. */}
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="aspect-video w-full -scale-x-100 object-cover"
          />
        </div>

        <div className="flex justify-center">
          {saving ? (
            <Button disabled>
              <Loader2 className="size-4 animate-spin" />
              در حال ذخیره...
            </Button>
          ) : recording ? (
            <Button variant="destructive" onClick={stopRecording}>
              <Square className="size-4" />
              توقف و ذخیره
            </Button>
          ) : (
            <Button onClick={startRecording}>
              <Circle className="size-4 fill-current" />
              شروع ضبط
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
