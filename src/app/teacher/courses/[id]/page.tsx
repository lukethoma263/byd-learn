import { redirect, notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { requireSession } from "@/lib/auth";
import { getCourse, listMaterials } from "@/lib/data";
import { CourseEditor } from "./CourseEditor";

type Props = { params: Promise<{ id: string }> };

export default async function TeacherCoursePage({ params }: Props) {
  const session = await requireSession("teacher");
  if (!session) redirect("/login");
  const { id } = await params;
  const course = await getCourse(id);
  if (!course || course.created_by !== session.userId) notFound();
  const materials = await listMaterials({ courseId: id });

  return (
    <AppShell role="teacher" name={session.name}>
      <CourseEditor course={course} materials={materials} />
    </AppShell>
  );
}
