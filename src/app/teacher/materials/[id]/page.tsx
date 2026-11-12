import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { MaterialViewer } from "@/components/MaterialViewer";
import { requireSession } from "@/lib/auth";
import { getMaterial } from "@/lib/data";

type Props = { params: Promise<{ id: string }> };

export default async function TeacherMaterialPage({ params }: Props) {
  const session = await requireSession("teacher");
  if (!session) redirect("/login");
  const { id } = await params;
  const material = await getMaterial(id);
  if (!material || material.created_by !== session.userId) notFound();
  if (material.kind === "document") {
    redirect(`/teacher/documents/${material.id}`);
  }

  return (
    <AppShell role="teacher" name={session.name}>
      <div className="mb-4">
        <Link
          href={
            material.course_id
              ? `/teacher/courses/${material.course_id}`
              : "/teacher"
          }
          className="text-sm font-semibold text-leaf hover:underline"
        >
          ← Back
        </Link>
      </div>
      <MaterialViewer material={material} />
    </AppShell>
  );
}
