import { sql } from "./db";
import bcrypt from "bcryptjs";

let seeded: Promise<void> | null = null;

export function ensureSeeded() {
  seeded ??= seed().catch((error) => {
    seeded = null;
    throw error;
  });
  return seeded;
}

async function seed() {
  const existing = await sql<{ count: string }>(
    "select count(*)::text as count from users",
  );
  if (Number(existing[0]?.count ?? 0) > 0) return;

  const teacherHash = await bcrypt.hash("teacher123", 10);
  const studentHash = await bcrypt.hash("student123", 10);

  await sql(
    `insert into users (id, email, name, role, password_hash) values
      ($1, $2, $3, $4, $5),
      ($6, $7, $8, $9, $10)`,
    [
      "user-teacher-demo",
      "teacher@byd.learn",
      "Avery Chen",
      "teacher",
      teacherHash,
      "user-student-demo",
      "student@byd.learn",
      "Jordan Blake",
      "student",
      studentHash,
    ],
  );

  await sql(
    `insert into courses (id, title, description, created_by, published) values
      ($1, $2, $3, $4, true)`,
    [
      "course-orientation",
      "Welcome to BYD Learn",
      "A starter course so students can browse materials right away. Replace or extend it from the teacher workspace.",
      "user-teacher-demo",
    ],
  );

  await sql(
    `insert into materials (id, course_id, title, kind, body, sort_order, created_by) values
      ($1, $2, $3, 'document', $4, 0, $5),
      ($6, null, $7, 'document', $8, 0, $5)`,
    [
      "mat-welcome-doc",
      "course-orientation",
      "How to use this course",
      `# Getting started

Open PDF materials in the viewer. For full InDesign interactivity (buttons, media, forms), download and open in Adobe Acrobat when the browser viewer falls short.

## Student tips
- Browse published courses from your home
- Open PDFs and videos from the course page
- Teaching documents appear alongside media

## Teacher tip
Upload interactive PDFs from the course editor. Add optional videos and rich-text documents as supporting material.`,
      "user-teacher-demo",
      "mat-standalone-guide",
      "Teaching materials guide",
      `# Standalone teaching materials

Documents can live on a course or as standalone materials in the teacher library. Students only see course-attached published content from the student space.`,
    ],
  );
}
