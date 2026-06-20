import { Button } from "@/components/ui/button";

const WORKFLOW = [
  "ایده",
  "اسکریپت",
  "ضبط",
  "آپلود",
  "ویرایش با متن",
  "پاکسازی خودکار",
  "نور و رنگ",
  "موزیک",
  "زیرنویس",
  "خروجی",
];

export default function Home() {
  return (
    <main className="relative isolate flex flex-1 flex-col items-center justify-center gap-10 overflow-hidden px-6 py-24 text-center">
      {/* Background texture: faint dot grid, masked to fade toward the edges. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.2)_1px,transparent_1px)] bg-[size:22px_22px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]"
      />
      {/* Soft brand glow behind the hero. */}
      <div
        aria-hidden
        className="pointer-events-none absolute right-[-5%] top-[0%] -z-10 h-[460px] w-[460px] -translate-x-1/2 rounded-full bg-primary/10 blur-[150px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-[15%] bottom-[-50%] -z-10 h-[764px] w-[764px] -translate-x-1/2 rounded-full bg-primary/10 blur-[250px]"
      />

      <span className="rounded-full border border-border bg-card px-4 py-1.5 text-sm text-muted-foreground">
        پلتفرم تدوین ویدیو با هوش مصنوعی
      </span>

      <div className="space-y-4">
        <h1 className="text-4xl font-bold sm:text-6xl font-eng">SipCut</h1>
        <p className="mx-auto max-w-xl text-lg text-muted-foreground">
          از ایده تا ریلز منتشر شده، سریع‌ترین مسیر برای کریتورهای اینستاگرام.
        </p>
      </div>

      <ol className="flex max-w-2xl flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground">
        {WORKFLOW.map((step, i) => (
          <li key={step} className="flex items-center gap-2">
            <span className="rounded-lg bg-secondary px-3 py-1.5 text-secondary-foreground">
              {step}
            </span>
            {i < WORKFLOW.length - 1 && <span aria-hidden>←</span>}
          </li>
        ))}
      </ol>

      <Button size="lg">شروع کنید</Button>
    </main>
  );
}
