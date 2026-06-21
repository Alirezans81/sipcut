"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api-client";
import {
  isValidIranianMobile,
  login,
  register,
  sendOtp,
} from "@/lib/auth-api";

type Mode = "login" | "register";

const COPY: Record<Mode, { title: string; cta: string; altText: string; altHref: string; altLabel: string }> = {
  login: {
    title: "ورود",
    cta: "ورود",
    altText: "حساب کاربری ندارید؟",
    altHref: "/register",
    altLabel: "ثبت‌نام",
  },
  register: {
    title: "ثبت‌نام",
    cta: "ایجاد حساب",
    altText: "قبلاً ثبت‌نام کرده‌اید؟",
    altHref: "/login",
    altLabel: "ورود",
  },
};

export function OtpAuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const { login: signIn } = useAuth();
  const copy = COPY[mode];

  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSendOtp() {
    if (!isValidIranianMobile(phone)) {
      toast.error("شماره موبایل معتبر نیست.");
      return;
    }
    setLoading(true);
    try {
      const res = await sendOtp(phone);
      setStep("otp");
      // In development the backend returns the code so we can prefill it.
      if (res.debug_otp) {
        setOtp(res.debug_otp);
        toast.info(`کد توسعه: ${res.debug_otp}`);
      } else {
        toast.success(res.detail);
      }
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "خطا در ارسال کد.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify() {
    if (otp.trim().length < 4) {
      toast.error("کد تأیید را وارد کنید.");
      return;
    }
    setLoading(true);
    try {
      const verify = mode === "register" ? register : login;
      const res = await verify(phone, otp.trim());
      signIn({ access: res.access, refresh: res.refresh });
      toast.success("خوش آمدید!");
      router.replace("/dashboard");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "کد تأیید نادرست است.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">{copy.title}</CardTitle>
        <CardDescription>
          {step === "phone"
            ? "شماره موبایل خود را وارد کنید تا کد تأیید برایتان ارسال شود."
            : `کد تأیید ارسال‌شده به ${phone} را وارد کنید.`}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {step === "phone" ? (
          <Input
            type="tel"
            inputMode="tel"
            dir="ltr"
            placeholder="09xxxxxxxxx"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !loading && handleSendOtp()}
            autoFocus
            disabled={loading}
          />
        ) : (
          <Input
            type="text"
            inputMode="numeric"
            dir="ltr"
            placeholder="------"
            className="text-center tracking-[0.5em]"
            value={otp}
            maxLength={8}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            onKeyDown={(e) => e.key === "Enter" && !loading && handleVerify()}
            autoFocus
            disabled={loading}
          />
        )}
      </CardContent>

      <CardFooter className="flex flex-col gap-3">
        {step === "phone" ? (
          <Button className="w-full" onClick={handleSendOtp} disabled={loading}>
            {loading && <Loader2 className="size-4 animate-spin" />}
            ارسال کد تأیید
          </Button>
        ) : (
          <>
            <Button className="w-full" onClick={handleVerify} disabled={loading}>
              {loading && <Loader2 className="size-4 animate-spin" />}
              {copy.cta}
            </Button>
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => setStep("phone")}
              disabled={loading}
            >
              تغییر شماره
            </Button>
          </>
        )}

        <p className="text-center text-sm text-muted-foreground">
          {copy.altText}{" "}
          <Link href={copy.altHref} className="text-primary hover:underline">
            {copy.altLabel}
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
