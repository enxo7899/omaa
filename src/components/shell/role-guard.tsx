"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import type { Role } from "@/lib/types";
import { ShellSkeleton } from "./app-shell";

/** Client-side guard: redirects to the role switcher when the session doesn't match. */
export function RoleGuard({ role, children }: { role: Role; children: React.ReactNode }) {
  const { hydrated, session } = useStore();
  const router = useRouter();
  const ok = hydrated && session?.role === role;

  React.useEffect(() => {
    if (hydrated && !ok) router.replace("/");
  }, [hydrated, ok, router]);

  if (!ok) return <ShellSkeleton />;
  return <>{children}</>;
}
