"use client";

import { MarkdownLite } from "./MarkdownLite";

type Material = {
  id: string;
  title: string;
  kind: "pdf" | "video" | "document";
  body: string | null;
  file_name: string | null;
};

export function MaterialViewer({ material }: { material: Material }) {
  if (material.kind === "document") {
    return (
      <article className="surface p-6 sm:p-8">
        <h1 className="font-display mb-6 text-3xl font-bold tracking-tight text-forest">
          {material.title}
        </h1>
        <MarkdownLite content={material.body || ""} />
      </article>
    );
  }

  if (material.kind === "video") {
    return (
      <article className="surface overflow-hidden">
        <div className="border-b border-[var(--line)] px-5 py-4">
          <h1 className="font-display text-2xl font-bold text-forest">{material.title}</h1>
          <p className="mt-1 text-sm text-muted">{material.file_name}</p>
        </div>
        <video
          className="aspect-video w-full bg-forest-deep"
          controls
          preload="metadata"
          src={`/api/files/${material.id}`}
        >
          Your browser does not support video playback.
        </video>
      </article>
    );
  }

  return (
    <article className="surface overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-[var(--line)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-forest">{material.title}</h1>
          <p className="mt-1 text-sm text-muted">
            Interactive PDF · browser support varies. For full InDesign features, open in Adobe
            Acrobat.
          </p>
        </div>
        <a
          className="btn btn-secondary !py-2 text-sm"
          href={`/api/files/${material.id}?download=1`}
        >
          Download PDF
        </a>
      </div>
      <iframe
        title={material.title}
        src={`/api/files/${material.id}#toolbar=1&navpanes=0`}
        className="h-[75vh] w-full bg-[#1b2420]"
      />
    </article>
  );
}
