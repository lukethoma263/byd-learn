"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type CourseOption = { id: string; title: string };

export function NewDocumentForm({ courses }: { courses: CourseOption[] }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("# New document\n\nStart writing…");
  const [courseId, setCourseId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/materials", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        body,
        courseId: courseId || null,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Could not create document.");
      return;
    }
    router.push(`/teacher/documents/${data.material.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="surface space-y-4 p-6 sm:p-8">
      <h2 className="font-display text-2xl font-semibold text-forest">New document</h2>
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
          Attach to course (optional)
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
          Content
        </label>
        <textarea
          id="body"
          className="field min-h-48 font-mono text-sm"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
        />
      </div>
      {error ? <p className="text-sm text-copper">{error}</p> : null}
      <button className="btn btn-primary" type="submit" disabled={loading}>
        {loading ? "Saving…" : "Create document"}
      </button>
    </form>
  );
}
