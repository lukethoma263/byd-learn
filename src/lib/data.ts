import { randomUUID } from "node:crypto";
import { sql } from "./db";
import { ensureSeeded } from "./seed";
import type { Course, Material } from "./types";

export async function listCourses(opts?: {
  teacherId?: string;
  publishedOnly?: boolean;
}) {
  await ensureSeeded();
  if (opts?.teacherId) {
    return sql<Course>(
      `select id, title, description, created_by, published,
              created_at::text, updated_at::text
       from courses where created_by = $1
       order by updated_at desc`,
      [opts.teacherId],
    );
  }
  if (opts?.publishedOnly) {
    return sql<Course>(
      `select id, title, description, created_by, published,
              created_at::text, updated_at::text
       from courses where published = true
       order by updated_at desc`,
    );
  }
  return sql<Course>(
    `select id, title, description, created_by, published,
            created_at::text, updated_at::text
     from courses order by updated_at desc`,
  );
}

export async function getCourse(id: string) {
  await ensureSeeded();
  const rows = await sql<Course>(
    `select id, title, description, created_by, published,
            created_at::text, updated_at::text
     from courses where id = $1`,
    [id],
  );
  return rows[0] ?? null;
}

export async function createCourse(input: {
  title: string;
  description: string;
  createdBy: string;
}) {
  const id = randomUUID();
  await sql(
    `insert into courses (id, title, description, created_by)
     values ($1, $2, $3, $4)`,
    [id, input.title, input.description, input.createdBy],
  );
  return getCourse(id);
}

export async function updateCourse(
  id: string,
  input: { title: string; description: string; published: boolean },
) {
  await sql(
    `update courses
     set title = $2, description = $3, published = $4, updated_at = now()
     where id = $1`,
    [id, input.title, input.description, input.published],
  );
  return getCourse(id);
}

export async function deleteCourse(id: string) {
  await sql(`delete from courses where id = $1`, [id]);
}

export async function listMaterials(opts?: {
  courseId?: string | null;
  standaloneOnly?: boolean;
  teacherId?: string;
}) {
  await ensureSeeded();
  if (opts?.standaloneOnly) {
    return sql<Material>(
      `select id, course_id, title, kind, body, mime_type, file_name, sort_order,
              created_by, created_at::text, updated_at::text
       from materials
       where course_id is null
         and ($1::text is null or created_by = $1)
       order by updated_at desc`,
      [opts.teacherId ?? null],
    );
  }
  if (opts?.courseId) {
    return sql<Material>(
      `select id, course_id, title, kind, body, mime_type, file_name, sort_order,
              created_by, created_at::text, updated_at::text
       from materials
       where course_id = $1
       order by sort_order asc, created_at asc`,
      [opts.courseId],
    );
  }
  return sql<Material>(
    `select id, course_id, title, kind, body, mime_type, file_name, sort_order,
            created_by, created_at::text, updated_at::text
     from materials
     order by updated_at desc`,
  );
}

export async function getMaterial(id: string) {
  await ensureSeeded();
  const rows = await sql<Material>(
    `select id, course_id, title, kind, body, mime_type, file_name, sort_order,
            created_by, created_at::text, updated_at::text
     from materials where id = $1`,
    [id],
  );
  return rows[0] ?? null;
}

export async function getMaterialFile(id: string) {
  await ensureSeeded();
  const rows = await sql<{
    id: string;
    title: string;
    kind: string;
    mime_type: string | null;
    file_name: string | null;
    file_data: Uint8Array | Buffer | null;
  }>(
    `select id, title, kind, mime_type, file_name, file_data
     from materials where id = $1`,
    [id],
  );
  return rows[0] ?? null;
}

export async function createDocument(input: {
  title: string;
  body: string;
  courseId: string | null;
  createdBy: string;
}) {
  const id = randomUUID();
  await sql(
    `insert into materials (id, course_id, title, kind, body, created_by)
     values ($1, $2, $3, 'document', $4, $5)`,
    [id, input.courseId, input.title, input.body, input.createdBy],
  );
  return getMaterial(id);
}

export async function updateDocument(
  id: string,
  input: { title: string; body: string; courseId: string | null },
) {
  await sql(
    `update materials
     set title = $2, body = $3, course_id = $4, updated_at = now()
     where id = $1 and kind = 'document'`,
    [id, input.title, input.body, input.courseId],
  );
  return getMaterial(id);
}

export async function createUpload(input: {
  title: string;
  kind: "pdf" | "video";
  courseId: string | null;
  createdBy: string;
  mimeType: string;
  fileName: string;
  fileData: Buffer;
}) {
  const id = randomUUID();
  await sql(
    `insert into materials
      (id, course_id, title, kind, mime_type, file_name, file_data, created_by)
     values ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      id,
      input.courseId,
      input.title,
      input.kind,
      input.mimeType,
      input.fileName,
      input.fileData,
      input.createdBy,
    ],
  );
  return getMaterial(id);
}

export async function deleteMaterial(id: string) {
  await sql(`delete from materials where id = $1`, [id]);
}
