import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { createCourse, listCourses } from "@/lib/data";

export async function GET() {
  const session = await requireSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.role === "teacher") {
    const courses = await listCourses({ teacherId: session.userId });
    return NextResponse.json({ courses });
  }
  const courses = await listCourses({ publishedOnly: true });
  return NextResponse.json({ courses });
}

export async function POST(request: Request) {
  const session = await requireSession("teacher");
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json().catch(() => null);
  const title = String(body?.title ?? "").trim();
  const description = String(body?.description ?? "").trim();
  if (!title) {
    return NextResponse.json({ error: "Title is required." }, { status: 400 });
  }
  const course = await createCourse({
    title,
    description,
    createdBy: session.userId,
  });
  return NextResponse.json({ course }, { status: 201 });
}
