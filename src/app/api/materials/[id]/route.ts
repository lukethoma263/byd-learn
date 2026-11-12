import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import {
  deleteMaterial,
  getCourse,
  getMaterial,
  updateDocument,
} from "@/lib/data";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const session = await requireSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const material = await getMaterial(id);
  if (!material) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (session.role === "student") {
    if (!material.course_id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const course = await getCourse(material.course_id);
    if (!course?.published) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
  } else if (material.created_by !== session.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return NextResponse.json({ material });
}

export async function PATCH(request: Request, { params }: Params) {
  const session = await requireSession("teacher");
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const material = await getMaterial(id);
  if (!material || material.created_by !== session.userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (material.kind !== "document") {
    return NextResponse.json(
      { error: "Only documents can be edited this way." },
      { status: 400 },
    );
  }
  const body = await request.json().catch(() => null);
  const courseId =
    body?.courseId === null
      ? null
      : body?.courseId !== undefined
        ? String(body.courseId || "") || null
        : material.course_id;
  const updated = await updateDocument(id, {
    title: String(body?.title ?? material.title).trim() || material.title,
    body: String(body?.body ?? material.body ?? ""),
    courseId,
  });
  return NextResponse.json({ material: updated });
}

export async function DELETE(_request: Request, { params }: Params) {
  const session = await requireSession("teacher");
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const material = await getMaterial(id);
  if (!material || material.created_by !== session.userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  await deleteMaterial(id);
  return NextResponse.json({ ok: true });
}
