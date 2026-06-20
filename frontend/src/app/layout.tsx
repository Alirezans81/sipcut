import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/lib/auth-context";

// Typography (docs/UI.md). Vazir is the default app typeface (`font-sans`);
// Inter is exposed as `--font-inter` and opted into for English/Latin text via
// the `font-eng` utility. See globals.css for how the variables map to utilities.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// Self-hosted Vazir (public/fonts/*) — primary Persian (Farsi) typeface.
// All six weights are registered so font-weight utilities (thin → black) work.
const vazir = localFont({
  src: [
    { path: "../../public/fonts/Vazir-Thin.ttf", weight: "100", style: "normal" },
    { path: "../../public/fonts/Vazir-Light.ttf", weight: "300", style: "normal" },
    { path: "../../public/fonts/Vazir.ttf", weight: "400", style: "normal" },
    { path: "../../public/fonts/Vazir-Medium.ttf", weight: "500", style: "normal" },
    { path: "../../public/fonts/Vazir-Bold.ttf", weight: "700", style: "normal" },
    { path: "../../public/fonts/Vazir-Black.ttf", weight: "900", style: "normal" },
  ],
  variable: "--font-vazir",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SipCut",
  description:
    "از ایده تا ریلز منتشر شده، سریع‌ترین مسیر برای کریتورهای اینستاگرام.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Platform language is Persian (Farsi) → RTL. Dark mode is the default theme.
  return (
    <html
      lang="fa"
      dir="rtl"
      className={`dark ${inter.variable} ${vazir.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <AuthProvider>{children}</AuthProvider>
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
