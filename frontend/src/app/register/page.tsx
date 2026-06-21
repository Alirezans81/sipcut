import { OtpAuthForm } from "@/components/auth/otp-auth-form";
import { BackgroundTexture } from "@/components/background-texture";

export default function RegisterPage() {
  return (
    <main className="relative isolate flex flex-1 items-center justify-center overflow-hidden px-6 py-16">
      <BackgroundTexture />
      <OtpAuthForm mode="register" />
    </main>
  );
}
