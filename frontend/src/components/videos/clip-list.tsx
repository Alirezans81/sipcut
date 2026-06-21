"use client";

import { useState } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Check, GripVertical, Pencil, Trash2, Video as VideoIcon, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { formatDuration } from "@/lib/media";
import type { Video } from "@/lib/types";

export function ClipList({
  videos,
  onReorder,
  onRename,
  onDelete,
}: {
  videos: Video[];
  onReorder: (next: Video[]) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = videos.findIndex((v) => v.id === active.id);
      const newIndex = videos.findIndex((v) => v.id === over.id);
      onReorder(arrayMove(videos, oldIndex, newIndex));
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={videos.map((v) => v.id)}
        strategy={verticalListSortingStrategy}
      >
        <ul className="space-y-2">
          {videos.map((video, index) => (
            <SortableClip
              key={video.id}
              video={video}
              index={index}
              onRename={onRename}
              onDelete={onDelete}
            />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}

function SortableClip({
  video,
  index,
  onRename,
  onDelete,
}: {
  video: Video;
  index: number;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: video.id });
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(video.name);

  function commit() {
    const name = draft.trim();
    if (name && name !== video.name) onRename(video.id, name);
    else setDraft(video.name);
    setEditing(false);
  }

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "flex items-center gap-3 rounded-xl border border-border bg-card p-3",
        isDragging && "z-10 opacity-80 shadow-lg",
      )}
    >
      <button
        type="button"
        className="cursor-grab touch-none text-muted-foreground active:cursor-grabbing"
        aria-label="جابه‌جایی"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-5" />
      </button>

      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
        <VideoIcon className="size-4" />
      </span>

      <div className="min-w-0 flex-1">
        {editing ? (
          <div className="flex items-center gap-1">
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") commit();
                if (e.key === "Escape") {
                  setDraft(video.name);
                  setEditing(false);
                }
              }}
              autoFocus
              className="h-8"
            />
            <Button size="icon-sm" variant="ghost" onClick={commit} aria-label="ذخیره">
              <Check className="size-4" />
            </Button>
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={() => {
                setDraft(video.name);
                setEditing(false);
              }}
              aria-label="انصراف"
            >
              <X className="size-4" />
            </Button>
          </div>
        ) : (
          <p className="truncate text-sm font-medium">
            <span className="text-muted-foreground">{index + 1}. </span>
            {video.name}
          </p>
        )}
        {!editing && video.duration > 0 && (
          <p className="text-xs text-muted-foreground" dir="ltr">
            {formatDuration(video.duration)}
          </p>
        )}
      </div>

      {!editing && (
        <div className="flex items-center">
          <Button
            size="icon-sm"
            variant="ghost"
            onClick={() => setEditing(true)}
            aria-label="تغییر نام"
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            size="icon-sm"
            variant="ghost"
            onClick={() => onDelete(video.id)}
            aria-label="حذف"
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      )}
    </li>
  );
}
