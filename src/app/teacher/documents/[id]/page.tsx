import { notFound, redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { requireSession } from "@/lib/auth";
import { getMaterial, listCourses } from "@/lib/data";
import { DocumentEditor } from "./DocumentEditor";

type Props = { params: Promise<{ id: string }> };

export default async function TeacherDocumentPage({ params }: Props) {
  const session = await requireSession("teacher");
  if (!session) redirect("/login");
  const { id } = await params;
  const material = await getMaterial(id);
  if (!material || material.created_by !== session.userId || material.kind !== "document") {
    notFound();
  }
  const courses = await listCourses({ teacherId: session.userId });

  return (
    <AppShell role="teacher" name={session.name}>
      <DocumentEditor
        material={material}
        courses={courses.map((c) => ({ id: c.id, title: c.title }))}
      />
    </AppShell>
  );
}
