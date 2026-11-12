import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { requireSession } from "@/lib/auth";
import { listCourses, listMaterials } from "@/lib/data";

export default async function TeacherHomePage() {
  const session = await requireSession("teacher");
  if (!session) redirect("/login");

  const [courses, standalone] = await Promise.all([
    listCourses({ teacherId: session.userId }),
    listMaterials({ standaloneOnly: true, teacherId: session.userId }),
  ]);

  return (
    <AppShell role="teacher" name={session.name}>
      <div className="animate-rise mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-leaf">
            Teacher studio
          </p>
          <h1 className="font-display mt-2 text-4xl font-bold tracking-tight text-forest">
            Your courses
          </h1>
          <p className="mt-2 max-w-xl text-muted">
            Create training courses, attach interactive PDFs and videos, and write teaching
            documents.
          </p>
        </div>
        <Link href="/teacher/courses/new" className="btn btn-primary">
          New course
        </Link>
      </div>

      <div className="grid gap-4">
        {courses.length === 0 ? (
          <div className="surface p-8 text-muted">
            No courses yet. Create your first course to upload materials.
          </div>
        ) : (
          courses.map((course) => (
            <Link
              key={course.id}
              href={`/teacher/courses/${course.id}`}
              className="surface block p-5 transition hover:-translate-y-0.5 sm:p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-display text-2xl font-semibold text-forest">
                    {course.title}
                  </h2>
                  <p className="mt-2 max-w-2xl text-muted">
                    {course.description || "No description yet."}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    course.published
                      ? "bg-moss text-forest"
                      : "bg-copper-soft text-copper"
                  }`}
                >
                  {course.published ? "Published" : "Draft"}
                </span>
              </div>
            </Link>
          ))
        )}
      </div>

      <section className="mt-12">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="font-display text-2xl font-semibold text-forest">
            Standalone documents
          </h2>
          <Link href="/teacher/documents" className="btn btn-secondary !py-2 text-sm">
            Manage docs
          </Link>
        </div>
        {standalone.length === 0 ? (
          <p className="text-muted">No standalone teaching materials yet.</p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {standalone.map((doc) => (
              <li key={doc.id} className="surface p-4">
                <Link
                  href={`/teacher/documents/${doc.id}`}
                  className="font-semibold text-forest hover:underline"
                >
                  {doc.title}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </AppShell>
  );
}
