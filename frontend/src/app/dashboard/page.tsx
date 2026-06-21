"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

import { RequireAuth } from "@/components/auth/require-auth";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { getMe } from "@/lib/auth-api";
import type { User } from "@/lib/types";

function DashboardContent() {
  const { logout } = useAuth();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    getMe()
      .then(setUser)
      .catch(() => {
        // A failed /me (e.g. revoked token) sends the user back to login.
        logout();
        router.replace("/login");
      });
  }, [logout, router]);

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  return (
    <main className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-border px-6 py-4">
        <span className="text-lg font-bold font-eng">SipCut</span>
        <Button variant="secondary" size="sm" onClick={handleLogout}>
          <LogOut className="size-4" />
          خروج
        </Button>
      </header>

      <section className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
        <h1 className="text-2xl font-bold">
          {user ? "خوش آمدید 👋" : "در حال بارگذاری..."}
        </h1>
        {user && (
          <p className="text-muted-foreground" dir="ltr">
            {user.phone_number}
          </p>
        )}
        <p className="max-w-md text-sm text-muted-foreground">
          داشبورد پروژه‌ها در مرحله بعد اضافه می‌شود.
        </p>
      </section>
    </main>
  );
}

export default function DashboardPage() {
  return (
    <RequireAuth>
      <DashboardContent />
    </RequireAuth>
  );
}
