import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export default async function HomePage() {
  const session = await getSession();
  if (session?.role === "teacher") redirect("/teacher");
  if (session?.role === "student") redirect("/student");

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div
        aria-hidden
        className="animate-drift pointer-events-none absolute inset-x-0 top-0 h-[70vh] bg-[radial-gradient(ellipse_at_center,rgba(47,107,82,0.28),transparent_65%)]"
      />
      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-8 sm:px-6">
        <header className="flex items-center justify-between">
          <p className="brand-mark text-2xl text-forest sm:text-3xl">BYD Learn</p>
          <Link href="/login" className="btn btn-secondary">
            Sign in
          </Link>
        </header>

        <section className="flex flex-1 flex-col justify-center gap-8 py-16 lg:max-w-3xl">
          <div className="animate-rise">
            <h1 className="font-display text-5xl font-bold leading-[0.95] tracking-tight text-forest sm:text-6xl lg:text-7xl">
              Training that lives in the materials you already make.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted sm:text-xl">
              Teachers publish courses with interactive InDesign PDFs, videos, and documents.
              Students open a calm study space—nothing else in the way.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/login" className="btn btn-primary">
                Enter workspace
              </Link>
              <Link href="/login?role=student" className="btn btn-secondary">
                Try as student
              </Link>
            </div>
          </div>
          <p className="animate-rise-delay text-sm text-muted">
            Demo accounts are ready on the sign-in page—no setup required.
          </p>
        </section>
      </div>
    </div>
  );
}
