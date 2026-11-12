"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

type Props = {
  role: "teacher" | "student";
  name: string;
  children: React.ReactNode;
};

export function AppShell({ role, name, children }: Props) {
  const router = useRouter();
  const home = role === "teacher" ? "/teacher" : "/student";

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-[var(--line)] bg-[color-mix(in_srgb,var(--paper)_82%,transparent)] backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link href={home} className="brand-mark text-xl text-forest sm:text-2xl">
            BYD Learn
          </Link>
          <nav className="flex items-center gap-2 text-sm sm:gap-3">
            {role === "teacher" ? (
              <>
                <Link className="rounded-full px-3 py-2 hover:bg-moss" href="/teacher">
                  Courses
                </Link>
                <Link
                  className="rounded-full px-3 py-2 hover:bg-moss"
                  href="/teacher/documents"
                >
                  Documents
                </Link>
              </>
            ) : (
              <Link className="rounded-full px-3 py-2 hover:bg-moss" href="/student">
                My courses
              </Link>
            )}
            <span className="hidden text-muted sm:inline">{name}</span>
            <button type="button" className="btn btn-secondary !py-2 !px-3 text-sm" onClick={logout}>
              Sign out
            </button>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">{children}</main>
    </div>
  );
}
