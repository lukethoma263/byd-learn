import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { MaterialViewer } from "@/components/MaterialViewer";
import { requireSession } from "@/lib/auth";
import { getCourse, getMaterial } from "@/lib/data";

type Props = { params: Promise<{ id: string }> };

export default async function StudentMaterialPage({ params }: Props) {
  const session = await requireSession("student");
  if (!session) redirect("/login");
  const { id } = await params;
  const material = await getMaterial(id);
  if (!material?.course_id) notFound();
  const course = await getCourse(material.course_id);
  if (!course?.published) notFound();

  return (
    <AppShell role="student" name={session.name}>
      <div className="mb-4">
        <Link
          href={`/student/courses/${course.id}`}
          className="text-sm font-semibold text-leaf hover:underline"
        >
          ← {course.title}
        </Link>
      </div>
      <MaterialViewer material={material} />
    </AppShell>
  );
}
