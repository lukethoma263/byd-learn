"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import type { Course, Material } from "@/lib/types";

type Props = {
  course: Course;
  materials: Material[];
};

export function CourseEditor({ course, materials }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(course.title);
  const [description, setDescription] = useState(course.description);
  const [published, setPublished] = useState(course.published);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadKind, setUploadKind] = useState<"pdf" | "video">("pdf");
  const [file, setFile] = useState<File | null>(null);
  const [docTitle, setDocTitle] = useState("");
  const [docBody, setDocBody] = useState("");
  const [busy, setBusy] = useState(false);

  async function saveCourse(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    const res = await fetch(`/api/courses/${course.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, published }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error || "Save failed.");
      return;
    }
    setMessage("Course saved.");
    router.refresh();
  }

  async function uploadMaterial(event: FormEvent) {
    event.preventDefault();
    if (!file) {
      setError("Choose a file to upload.");
      return;
    }
    setBusy(true);
    setError("");
    setMessage("");
    const form = new FormData();
    form.set("title", uploadTitle || file.name);
    form.set("kind", uploadKind);
    form.set("courseId", course.id);
    form.set("file", file);
    const res = await fetch("/api/materials/upload", { method: "POST", body: form });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error || "Upload failed.");
      return;
    }
    setUploadTitle("");
    setFile(null);
    setMessage(`${uploadKind === "pdf" ? "PDF" : "Video"} uploaded.`);
    router.refresh();
  }

  async function createDoc(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    const res = await fetch("/api/materials", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: docTitle,
        body: docBody,
        courseId: course.id,
      }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error || "Could not create document.");
      return;
    }
    setDocTitle("");
    setDocBody("");
    setMessage("Document added to course.");
    router.refresh();
  }

  async function removeMaterial(id: string) {
    if (!confirm("Delete this material?")) return;
    setBusy(true);
    await fetch(`/api/materials/${id}`, { method: "DELETE" });
    setBusy(false);
    router.refresh();
  }

  async function removeCourse() {
    if (!confirm("Delete this course and its materials?")) return;
    setBusy(true);
    await fetch(`/api/courses/${course.id}`, { method: "DELETE" });
    router.push("/teacher");
    router.refresh();
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/teacher" className="text-sm font-semibold text-leaf hover:underline">
          ← All courses
        </Link>
        <button type="button" className="btn btn-secondary !py-2 text-sm" onClick={removeCourse}>
          Delete course
        </button>
      </div>

      <form onSubmit={saveCourse} className="surface space-y-4 p-6 sm:p-8">
        <h1 className="font-display text-3xl font-bold text-forest">Edit course</h1>
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
          <label className="label" htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            className="field min-h-28"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <label className="flex items-center gap-2 text-sm font-semibold text-forest">
          <input
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
          />
          Published for students
        </label>
        <button className="btn btn-primary" type="submit" disabled={busy}>
          Save course
        </button>
      </form>

      <section className="surface p-6 sm:p-8">
        <h2 className="font-display text-2xl font-semibold text-forest">Course materials</h2>
        <ul className="mt-4 space-y-3">
          {materials.length === 0 ? (
            <li className="text-muted">No materials yet.</li>
          ) : (
            materials.map((material) => (
              <li
                key={material.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--line)] bg-white/70 px-4 py-3"
              >
                <div>
                  <p className="font-semibold text-forest">{material.title}</p>
                  <p className="text-sm capitalize text-muted">{material.kind}</p>
                </div>
                <div className="flex gap-2">
                  <Link
                    className="btn btn-secondary !py-2 text-sm"
                    href={
                      material.kind === "document"
                        ? `/teacher/documents/${material.id}`
                        : `/teacher/materials/${material.id}`
                    }
                  >
                    Open
                  </Link>
                  <button
                    type="button"
                    className="btn btn-secondary !py-2 text-sm"
                    onClick={() => removeMaterial(material.id)}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))
          )}
        </ul>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={uploadMaterial} className="surface space-y-4 p-6">
          <h3 className="font-display text-xl font-semibold text-forest">
            Upload PDF or video
          </h3>
          <p className="text-sm text-muted">
            Adobe InDesign interactive PDFs are stored and served inline. Browser interactivity
            varies—students can download for Acrobat.
          </p>
          <div>
            <label className="label" htmlFor="uploadTitle">
              Title
            </label>
            <input
              id="uploadTitle"
              className="field"
              value={uploadTitle}
              onChange={(e) => setUploadTitle(e.target.value)}
              placeholder="Module 1 interactive PDF"
            />
          </div>
          <div>
            <label className="label" htmlFor="kind">
              Type
            </label>
            <select
              id="kind"
              className="field"
              value={uploadKind}
              onChange={(e) => setUploadKind(e.target.value as "pdf" | "video")}
            >
              <option value="pdf">Interactive PDF</option>
              <option value="video">Supporting video</option>
            </select>
          </div>
          <div>
            <label className="label" htmlFor="file">
              File
            </label>
            <input
              id="file"
              type="file"
              accept={uploadKind === "pdf" ? "application/pdf,.pdf" : "video/*,.mp4,.webm,.mov"}
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              required
            />
          </div>
          <button className="btn btn-copper" type="submit" disabled={busy}>
            Upload
          </button>
        </form>

        <form onSubmit={createDoc} className="surface space-y-4 p-6">
          <h3 className="font-display text-xl font-semibold text-forest">
            Create a document
          </h3>
          <div>
            <label className="label" htmlFor="docTitle">
              Title
            </label>
            <input
              id="docTitle"
              className="field"
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="label" htmlFor="docBody">
              Markdown / plain text
            </label>
            <textarea
              id="docBody"
              className="field min-h-40 font-mono text-sm"
              value={docBody}
              onChange={(e) => setDocBody(e.target.value)}
              placeholder={"# Lesson notes\n\nWrite supporting guidance here."}
              required
            />
          </div>
          <button className="btn btn-primary" type="submit" disabled={busy}>
            Add document
          </button>
        </form>
      </div>

      {message ? <p className="text-sm font-semibold text-leaf">{message}</p> : null}
      {error ? <p className="text-sm text-copper">{error}</p> : null}
    </div>
  );
}
