"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/lib/api-client";
import { createProject } from "@/lib/projects-api";
import type { Project } from "@/lib/types";

export function CreateProjectDialog({
  onCreated,
}: {
  onCreated?: (project: Project) => void;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    const trimmed = title.trim();
    if (!trimmed) {
      toast.error("عنوان پروژه را وارد کنید.");
      return;
    }
    setLoading(true);
    try {
      const project = await createProject(trimmed);
      onCreated?.(project);
      setOpen(false);
      setTitle("");
      // Per the user journey, creation leads into the project workspace.
      router.push(`/projects/${project.id}`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "خطا در ساخت پروژه.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className={buttonVariants()}>
        <Plus className="size-4" />
        پروژه جدید
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>ساخت پروژه جدید</DialogTitle>
          <DialogDescription>
            یک نام برای ریلز خود انتخاب کنید. بعداً می‌توانید ادامه دهید.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="project-title">نام پروژه</Label>
          <Input
            id="project-title"
            placeholder="مثلاً: ۵ نکته استایل مو"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !loading && handleSubmit()}
            autoFocus
            disabled={loading}
            maxLength={200}
          />
        </div>

        <DialogFooter>
          <DialogClose
            className={buttonVariants({ variant: "secondary" })}
            disabled={loading}
          >
            انصراف
          </DialogClose>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2 className="size-4 animate-spin" />}
            ادامه
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
