"use client";

import { useRef, useState } from "react";
import { Upload } from "lucide-react";

import { cn } from "@/lib/utils";

export function UploadDropzone({
  onFiles,
  disabled,
}: {
  onFiles: (files: File[]) => void;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  function pick(files: FileList | null) {
    const videos = Array.from(files ?? []).filter((f) => f.type.startsWith("video/"));
    if (videos.length) onFiles(videos);
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => !disabled && inputRef.current?.click()}
      onKeyDown={(e) => e.key === "Enter" && !disabled && inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        if (!disabled) pick(e.dataTransfer.files);
      }}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed p-8 text-center transition-colors",
        dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/60",
        disabled && "pointer-events-none opacity-60",
      )}
    >
      <span className="flex size-11 items-center justify-center rounded-full bg-secondary">
        <Upload className="size-5 text-primary" />
      </span>
      <p className="text-sm font-medium">ویدیوها را اینجا بکشید یا کلیک کنید</p>
      <p className="text-xs text-muted-foreground">MP4، MOV، WEBM — تا ۲۰۰ مگابایت</p>
      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        multiple
        hidden
        onChange={(e) => {
          pick(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}
