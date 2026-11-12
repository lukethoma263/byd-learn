"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { MarkdownLite } from "@/components/MarkdownLite";
import type { Material } from "@/lib/types";

type CourseOption = { id: string; title: string };

export function DocumentEditor({
  material,
  courses,
}: {
  material: Material;
  courses: CourseOption[];
}) {
  const router = useRouter();
  const [title, setTitle] = useState(material.title);
  const [body, setBody] = useState(material.body || "");
  const [courseId, setCourseId] = useState(material.course_id || "");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSave(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    const res = await fetch(`/api/materials/${material.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        body,
        courseId: courseId || null,
      }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error || "Save failed.");
      return;
    }
    setMessage("Document saved.");
    router.refresh();
  }

  async function onDelete() {
    if (!confirm("Delete this document?")) return;
    setBusy(true);
    await fetch(`/api/materials/${material.id}`, { method: "DELETE" });
    router.push("/teacher/documents");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/teacher/documents" className="text-sm font-semibold text-leaf hover:underline">
          ← Documents
        </Link>
        <button type="button" className="btn btn-secondary !py-2 text-sm" onClick={onDelete}>
          Delete
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={onSave} className="surface space-y-4 p-6">
          <h1 className="font-display text-3xl font-bold text-forest">Edit document</h1>
          <div>
            <label className="label" htmlFor="title">
              Title
            </label>
            <input
              id="title"
              className="field"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="label" htmlFor="courseId">
              Course attachment
            </label>
            <select
              id="courseId"
              className="field"
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
            >
              <option value="">Standalone</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="body">
              Markdown
            </label>
            <textarea
              id="body"
              className="field min-h-[28rem] font-mono text-sm"
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </div>
          <button className="btn btn-primary" type="submit" disabled={busy}>
            Save
          </button>
          {message ? <p className="text-sm font-semibold text-leaf">{message}</p> : null}
          {error ? <p className="text-sm text-copper">{error}</p> : null}
        </form>

        <article className="surface p-6">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.12em] text-muted">
            Preview
          </p>
          <h2 className="font-display mb-4 text-3xl font-bold text-forest">{title}</h2>
          <MarkdownLite content={body} />
        </article>
      </div>
    </div>
  );
}
