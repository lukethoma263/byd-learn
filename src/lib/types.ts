export type Role = "teacher" | "student";

export type User = {
  id: string;
  email: string;
  name: string;
  role: Role;
};

export type Course = {
  id: string;
  title: string;
  description: string;
  created_by: string;
  published: boolean;
  created_at: string;
  updated_at: string;
};

export type MaterialKind = "pdf" | "video" | "document";

export type Material = {
  id: string;
  course_id: string | null;
  title: string;
  kind: MaterialKind;
  body: string | null;
  mime_type: string | null;
  file_name: string | null;
  sort_order: number;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type SessionPayload = {
  userId: string;
  email: string;
  name: string;
  role: Role;
};
