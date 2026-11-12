import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { requireSession } from "@/lib/auth";
import { listCourses } from "@/lib/data";

export default async function StudentHomePage() {
  const session = await requireSession("student");
  if (!session) redirect("/login");
  const courses = await listCourses({ publishedOnly: true });

  return (
    <AppShell role="student" name={session.name}>
      <div className="animate-rise mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-leaf">
          Student space
        </p>
        <h1 className="font-display mt-2 text-4xl font-bold tracking-tight text-forest">
          Courses for you
        </h1>
        <p className="mt-2 max-w-xl text-muted">
          Browse published training and open interactive PDFs, videos, and documents. No editing
          tools here—just the materials.
        </p>
      </div>

      <div className="grid gap-4">
        {courses.length === 0 ? (
          <div className="surface p-8 text-muted">
            No published courses yet. Ask your teacher to publish one.
          </div>
        ) : (
          courses.map((course, index) => (
            <Link
              key={course.id}
              href={`/student/courses/${course.id}`}
              className="surface block p-5 transition hover:-translate-y-0.5 sm:p-6"
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <h2 className="font-display text-2xl font-semibold text-forest">{course.title}</h2>
              <p className="mt-2 max-w-2xl text-muted">
                {course.description || "Open the course to view materials."}
              </p>
              <span className="mt-4 inline-flex text-sm font-semibold text-leaf">
                Enter course →
              </span>
            </Link>
          ))
        )}
      </div>
    </AppShell>
  );
}
