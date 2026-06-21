"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";

/** Top bar for authenticated pages: brand wordmark + logout. */
export function AppHeader() {
  const { logout } = useAuth();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  return (
    <header className="flex items-center justify-between border-b border-border px-6 py-4">
      <Link href="/dashboard" className="text-lg font-bold font-eng">
        SipCut
      </Link>
      <Button variant="secondary" size="sm" onClick={handleLogout}>
        <LogOut className="size-4" />
        خروج
      </Button>
    </header>
  );
}
