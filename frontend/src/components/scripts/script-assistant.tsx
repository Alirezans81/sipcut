"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, Loader2, RefreshCw, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ApiError } from "@/lib/api-client";
import { generateScript, getScript } from "@/lib/scripts-api";
import { useAuth } from "@/lib/auth-context";
import type { Script } from "@/lib/types";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export function ScriptAssistant({ projectId }: { projectId: string }) {
  const router = useRouter();
  const { logout } = useAuth();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [script, setScript] = useState<Script | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastPrompt, setLastPrompt] = useState("");

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load any previously generated script for this project.
  useEffect(() => {
    getScript(projectId)
      .then((existing) => {
        if (existing) {
          setScript(existing);
          setMessages([
            { role: "assistant", content: "اسکریپت قبلی این پروژه بارگذاری شد." },
          ]);
        }
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          logout();
          router.replace("/login");
        }
      });
  }, [projectId, logout, router]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function runGeneration(prompt: string) {
    setLoading(true);
    try {
      const result = await generateScript(projectId, prompt);
      setScript(result);
      setLastPrompt(prompt);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `اسکریپت «${result.title}» آماده شد ✅` },
      ]);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        logout();
        router.replace("/login");
        return;
      }
      const msg = err instanceof ApiError ? err.message : "خطا در تولید اسکریپت.";
      toast.error(msg);
      setMessages((prev) => [...prev, { role: "assistant", content: msg }]);
    } finally {
      setLoading(false);
    }
  }

  function handleSend() {
    const prompt = input.trim();
    if (!prompt || loading) return;
    setMessages((prev) => [...prev, { role: "user", content: prompt }]);
    setInput("");
    runGeneration(prompt);
  }

  function handleRegenerate() {
    if (!lastPrompt || loading) return;
    setMessages((prev) => [
      ...prev,
      { role: "user", content: "یک نسخه دیگر بساز" },
    ]);
    runGeneration(lastPrompt);
  }

  return (
    <div className="grid min-h-0 flex-1 grid-rows-2 gap-4 lg:grid-cols-2 lg:grid-rows-1">
      <ChatPanel
        messages={messages}
        input={input}
        loading={loading}
        onInput={setInput}
        onSend={handleSend}
        chatEndRef={chatEndRef}
      />
      <ScriptPanel
        script={script}
        loading={loading}
        canRegenerate={Boolean(lastPrompt)}
        onRegenerate={handleRegenerate}
      />
    </div>
  );
}

function ChatPanel({
  messages,
  input,
  loading,
  onInput,
  onSend,
  chatEndRef,
}: {
  messages: ChatMessage[];
  input: string;
  loading: boolean;
  onInput: (v: string) => void;
  onSend: () => void;
  chatEndRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div className="flex min-h-0 flex-col rounded-2xl border border-border bg-card">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-ai/15 px-2.5 py-0.5 text-xs font-medium text-ai">
          <Sparkles className="size-3.5" />
          دستیار اسکریپت
        </span>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4">
        {messages.length === 0 && !loading ? (
          <p className="m-auto max-w-xs text-center text-sm text-muted-foreground">
            ایده‌ات رو بنویس تا برات یک اسکریپت کامل با قلاب، متن و دعوت به اقدام
            بسازم. مثلاً: «من مربی تناسب اندامم و می‌خوام درباره کاهش چربی ریلز
            بسازم.»
          </p>
        ) : (
          messages.map((m, i) => (
            <div
              key={i}
              className={cn(
                "max-w-[85%] rounded-2xl px-3.5 py-2 text-sm",
                m.role === "user"
                  ? "self-end bg-primary text-primary-foreground"
                  : "self-start bg-secondary text-secondary-foreground",
              )}
            >
              {m.content}
            </div>
          ))
        )}
        {loading && (
          <div className="self-start rounded-2xl bg-secondary px-3.5 py-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="flex items-center gap-2 border-t border-border p-3">
        <Input
          placeholder="ایده‌ات رو بنویس..."
          value={input}
          onChange={(e) => onInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleEnter(e, onSend)}
          disabled={loading}
        />
        <Button size="icon" onClick={onSend} disabled={loading || !input.trim()}>
          <Send className="size-4" />
        </Button>
      </div>
    </div>
  );
}

function handleEnter(
  e: React.KeyboardEvent,
  onSend: () => void,
) {
  if (!e.shiftKey) {
    e.preventDefault();
    onSend();
  }
}

function ScriptPanel({
  script,
  loading,
  canRegenerate,
  onRegenerate,
}: {
  script: Script | null;
  loading: boolean;
  canRegenerate: boolean;
  onRegenerate: () => void;
}) {
  function handleCopy() {
    if (!script) return;
    const text = [
      `عنوان: ${script.title}`,
      `قلاب: ${script.hook}`,
      `متن: ${script.script}`,
      `پلان‌ها:\n${script.shot_list.map((s) => `- ${s}`).join("\n")}`,
      `دعوت به اقدام: ${script.cta}`,
    ].join("\n\n");
    navigator.clipboard.writeText(text);
    toast.success("اسکریپت کپی شد.");
  }

  return (
    <div className="flex min-h-0 flex-col rounded-2xl border border-border bg-card">
      <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
        <span className="text-sm font-medium">اسکریپت</span>
        {script && (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onRegenerate}
              disabled={loading || !canRegenerate}
            >
              <RefreshCw className="size-4" />
              تولید دوباره
            </Button>
            <Button variant="ghost" size="sm" onClick={handleCopy} disabled={loading}>
              <Copy className="size-4" />
              کپی
            </Button>
          </div>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-5">
        {!script ? (
          <p className="m-auto flex h-full items-center justify-center text-center text-sm text-muted-foreground">
            اسکریپت تولیدشده اینجا نمایش داده می‌شود.
          </p>
        ) : (
          <div className="space-y-5">
            <h2 className="text-xl font-bold">{script.title}</h2>
            <Section label="قلاب">{script.hook}</Section>
            <Section label="متن">
              <p className="whitespace-pre-line leading-7">{script.script}</p>
            </Section>
            <Section label="لیست پلان">
              <ul className="list-disc space-y-1 pe-5">
                {script.shot_list.map((shot, i) => (
                  <li key={i}>{shot}</li>
                ))}
              </ul>
            </Section>
            <Section label="دعوت به اقدام">{script.cta}</Section>
          </div>
        )}
      </div>
    </div>
  );
}

function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <h3 className="text-xs font-medium text-muted-foreground">{label}</h3>
      <div className="text-sm leading-7">{children}</div>
    </div>
  );
}
