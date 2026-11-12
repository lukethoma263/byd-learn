import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { createDocument, listMaterials } from "@/lib/data";

export async function GET(request: Request) {
  const session = await requireSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const standalone = searchParams.get("standalone") === "1";
  if (standalone) {
    if (session.role !== "teacher") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const materials = await listMaterials({
      standaloneOnly: true,
      teacherId: session.userId,
    });
    return NextResponse.json({ materials });
  }
  const courseId = searchParams.get("courseId");
  if (!courseId) {
    return NextResponse.json({ error: "courseId required" }, { status: 400 });
  }
  const materials = await listMaterials({ courseId });
  return NextResponse.json({ materials });
}

export async function POST(request: Request) {
  const session = await requireSession("teacher");
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json().catch(() => null);
  const title = String(body?.title ?? "").trim();
  const content = String(body?.body ?? "");
  const courseId =
    body?.courseId === null || body?.courseId === ""
      ? null
      : String(body?.courseId ?? "").trim() || null;
  if (!title) {
    return NextResponse.json({ error: "Title is required." }, { status: 400 });
  }
  const material = await createDocument({
    title,
    body: content,
    courseId,
    createdBy: session.userId,
  });
  return NextResponse.json({ material }, { status: 201 });
}
