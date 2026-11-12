import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { getCourse, getMaterialFile } from "@/lib/data";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  const session = await requireSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const material = await getMaterialFile(id);
  if (!material || !material.file_data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (session.role === "student") {
    const meta = await import("@/lib/data").then((m) => m.getMaterial(id));
    if (!meta?.course_id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const course = await getCourse(meta.course_id);
    if (!course?.published) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
  } else {
    const meta = await import("@/lib/data").then((m) => m.getMaterial(id));
    if (!meta || meta.created_by !== session.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const bytes =
    material.file_data instanceof Buffer
      ? material.file_data
      : Buffer.from(material.file_data);

  const download = new URL(request.url).searchParams.get("download") === "1";
  const mime =
    material.mime_type ||
    (material.kind === "pdf" ? "application/pdf" : "application/octet-stream");
  const filename = material.file_name || `${material.title}.bin`;

  return new NextResponse(bytes, {
    headers: {
      "Content-Type": mime,
      "Content-Length": String(bytes.length),
      "Content-Disposition": `${download ? "attachment" : "inline"}; filename="${filename.replace(/"/g, "")}"`,
      "Cache-Control": "private, max-age=60",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
