import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import {
  deleteCourse,
  getCourse,
  listMaterials,
  updateCourse,
} from "@/lib/data";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const session = await requireSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const course = await getCourse(id);
  if (!course) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (session.role === "student" && !course.published) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (session.role === "teacher" && course.created_by !== session.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const materials = await listMaterials({ courseId: id });
  return NextResponse.json({ course, materials });
}

export async function PATCH(request: Request, { params }: Params) {
  const session = await requireSession("teacher");
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const course = await getCourse(id);
  if (!course || course.created_by !== session.userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const body = await request.json().catch(() => null);
  const updated = await updateCourse(id, {
    title: String(body?.title ?? course.title).trim() || course.title,
    description: String(body?.description ?? course.description),
    published:
      typeof body?.published === "boolean" ? body.published : course.published,
  });
  return NextResponse.json({ course: updated });
}

export async function DELETE(_request: Request, { params }: Params) {
  const session = await requireSession("teacher");
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const course = await getCourse(id);
  if (!course || course.created_by !== session.userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  await deleteCourse(id);
  return NextResponse.json({ ok: true });
}
