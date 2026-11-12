import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { createUpload, getCourse } from "@/lib/data";

const MAX_BYTES = 40 * 1024 * 1024;

export async function POST(request: Request) {
  const session = await requireSession("teacher");
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await request.formData();
  const file = form.get("file");
  const title = String(form.get("title") ?? "").trim();
  const kindRaw = String(form.get("kind") ?? "").trim();
  const courseIdRaw = String(form.get("courseId") ?? "").trim();
  const courseId = courseIdRaw || null;

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "File is required." }, { status: 400 });
  }
  if (!title) {
    return NextResponse.json({ error: "Title is required." }, { status: 400 });
  }
  if (kindRaw !== "pdf" && kindRaw !== "video") {
    return NextResponse.json({ error: "Invalid kind." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "File must be 40MB or smaller." },
      { status: 400 },
    );
  }
  if (courseId) {
    const course = await getCourse(courseId);
    if (!course || course.created_by !== session.userId) {
      return NextResponse.json({ error: "Course not found." }, { status: 404 });
    }
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const mimeType =
    file.type ||
    (kindRaw === "pdf" ? "application/pdf" : "application/octet-stream");

  if (kindRaw === "pdf" && !mimeType.includes("pdf") && !file.name.toLowerCase().endsWith(".pdf")) {
    return NextResponse.json(
      { error: "Upload a PDF file for interactive course content." },
      { status: 400 },
    );
  }

  const material = await createUpload({
    title,
    kind: kindRaw,
    courseId,
    createdBy: session.userId,
    mimeType,
    fileName: file.name,
    fileData: buffer,
  });

  return NextResponse.json({ material }, { status: 201 });
}
