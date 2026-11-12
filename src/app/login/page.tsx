"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useMemo, useState } from "react";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const preferred = params.get("role");
  const next = params.get("next");

  const [email, setEmail] = useState(
    preferred === "student" ? "student@byd.learn" : "teacher@byd.learn",
  );
  const [password, setPassword] = useState(
    preferred === "student" ? "student123" : "teacher123",
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const hint = useMemo(
    () =>
      preferred === "student"
        ? "Student demo credentials are prefilled."
        : "Teacher demo credentials are prefilled.",
    [preferred],
  );

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Sign-in failed.");
        return;
      }
      const role = data.user.role as "teacher" | "student";
      const destination =
        next && next.startsWith(`/${role}`)
          ? next
          : role === "teacher"
            ? "/teacher"
            : "/student";
      router.push(destination);
      router.refresh();
    } catch {
      setError("Could not reach the server.");
    } finally {
      setLoading(false);
    }
  }

  function fill(role: "teacher" | "student") {
    if (role === "teacher") {
      setEmail("teacher@byd.learn");
      setPassword("teacher123");
    } else {
      setEmail("student@byd.learn");
      setPassword("student123");
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl items-center px-4 py-10 sm:px-6">
      <div className="grid w-full gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="animate-rise flex flex-col justify-center">
          <Link href="/" className="brand-mark mb-8 text-3xl text-forest">
            BYD Learn
          </Link>
          <h1 className="font-display max-w-lg text-4xl font-bold tracking-tight text-forest sm:text-5xl">
            Sign in to your space.
          </h1>
          <p className="mt-4 max-w-md text-muted">
            Teachers build courses and upload interactive PDFs. Students only see the study view.
          </p>
        </section>

        <section className="animate-rise-delay surface p-6 sm:p-8">
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="label" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                className="field"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                className="field"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error ? <p className="text-sm text-copper">{error}</p> : null}
            <button className="btn btn-primary w-full" type="submit" disabled={loading}>
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <div className="mt-6 rounded-2xl bg-moss/60 p-4">
            <p className="text-sm font-semibold text-forest">{hint}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" className="btn btn-secondary !py-2 text-sm" onClick={() => fill("teacher")}>
                Teacher demo
              </button>
              <button type="button" className="btn btn-secondary !py-2 text-sm" onClick={() => fill("student")}>
                Student demo
              </button>
            </div>
            <ul className="mt-3 space-y-1 text-sm text-muted">
              <li>teacher@byd.learn / teacher123</li>
              <li>student@byd.learn / student123</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-10 text-muted">Loading…</div>}>
      <LoginForm />
    </Suspense>
  );
}
