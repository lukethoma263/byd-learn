import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { requireSession } from "@/lib/auth";
import { getCourse, listMaterials } from "@/lib/data";

type Props = { params: Promise<{ id: string }> };

const kindLabel = {
  pdf: "Interactive PDF",
  video: "Video",
  document: "Document",
} as const;

export default async function StudentCoursePage({ params }: Props) {
  const session = await requireSession("student");
  if (!session) redirect("/login");
  const { id } = await params;
  const course = await getCourse(id);
  if (!course || !course.published) notFound();
  const materials = await listMaterials({ courseId: id });

  return (
    <AppShell role="student" name={session.name}>
      <Link href="/student" className="text-sm font-semibold text-leaf hover:underline">
        ← All courses
      </Link>
      <div className="animate-rise mt-4 mb-8">
        <h1 className="font-display text-4xl font-bold tracking-tight text-forest">
          {course.title}
        </h1>
        <p className="mt-3 max-w-2xl text-muted">{course.description}</p>
      </div>

      <section className="grid gap-3">
        {materials.length === 0 ? (
          <div className="surface p-6 text-muted">This course has no materials yet.</div>
        ) : (
          materials.map((material) => (
            <Link
              key={material.id}
              href={`/student/materials/${material.id}`}
              className="surface flex flex-wrap items-center justify-between gap-3 p-5 transition hover:-translate-y-0.5"
            >
              <div>
                <p className="font-semibold text-forest">{material.title}</p>
                <p className="text-sm text-muted">{kindLabel[material.kind]}</p>
              </div>
              <span className="text-sm font-semibold text-leaf">Open →</span>
            </Link>
          ))
        )}
      </section>
    </AppShell>
  );
}
