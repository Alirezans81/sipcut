import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { BackgroundTexture } from "@/components/background-texture";

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
      <BackgroundTexture />

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

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link href="/register" className={buttonVariants({ size: "lg" })}>
          شروع کنید
        </Link>
        <Link
          href="/login"
          className={buttonVariants({ size: "lg", variant: "secondary" })}
        >
          ورود
        </Link>
      </div>
    </main>
  );
}
