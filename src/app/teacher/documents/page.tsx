import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { requireSession } from "@/lib/auth";
import { listCourses, listMaterials } from "@/lib/data";
import { NewDocumentForm } from "./NewDocumentForm";

export default async function TeacherDocumentsPage() {
  const session = await requireSession("teacher");
  if (!session) redirect("/login");

  const [standalone, courses] = await Promise.all([
    listMaterials({ standaloneOnly: true, teacherId: session.userId }),
    listCourses({ teacherId: session.userId }),
  ]);

  const courseDocs = (
    await Promise.all(courses.map((c) => listMaterials({ courseId: c.id })))
  )
    .flat()
    .filter((m) => m.kind === "document");

  return (
    <AppShell role="teacher" name={session.name}>
      <div className="animate-rise mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-leaf">
          Teacher studio
        </p>
        <h1 className="font-display mt-2 text-4xl font-bold text-forest">Documents</h1>
        <p className="mt-2 max-w-xl text-muted">
          Write markdown teaching materials as standalone notes or attach them to a course.
        </p>
      </div>

      <NewDocumentForm courses={courses.map((c) => ({ id: c.id, title: c.title }))} />

      <section className="mt-10 grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="font-display mb-3 text-2xl font-semibold text-forest">Standalone</h2>
          <ul className="space-y-3">
            {standalone.length === 0 ? (
              <li className="text-muted">None yet.</li>
            ) : (
              standalone.map((doc) => (
                <li key={doc.id} className="surface p-4">
                  <Link
                    href={`/teacher/documents/${doc.id}`}
                    className="font-semibold text-forest hover:underline"
                  >
                    {doc.title}
                  </Link>
                </li>
              ))
            )}
          </ul>
        </div>
        <div>
          <h2 className="font-display mb-3 text-2xl font-semibold text-forest">
            Attached to courses
          </h2>
          <ul className="space-y-3">
            {courseDocs.length === 0 ? (
              <li className="text-muted">None yet.</li>
            ) : (
              courseDocs.map((doc) => (
                <li key={doc.id} className="surface p-4">
                  <Link
                    href={`/teacher/documents/${doc.id}`}
                    className="font-semibold text-forest hover:underline"
                  >
                    {doc.title}
                  </Link>
                </li>
              ))
            )}
          </ul>
        </div>
      </section>
    </AppShell>
  );
}
