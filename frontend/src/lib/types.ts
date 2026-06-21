/** Shared domain types mirroring the backend (docs/DATABASE.md & USER_JOURNEY.md). */

/** Explicit project lifecycle states. The frontend always displays the current one. */
export type ProjectStatus =
  | "DRAFT"
  | "UPLOADING"
  | "PROCESSING"
  | "READY_FOR_EDITING"
  | "EXPORTING"
  | "COMPLETED"
  | "FAILED_UPLOAD"
  | "FAILED_TRANSCRIPT"
  | "FAILED_EXPORT";

export interface User {
  id: string;
  phone_number: string;
  created_at: string;
}

export interface Project {
  id: string;
  title: string;
  status: ProjectStatus;
  created_at: string;
  updated_at: string;
}

export interface Script {
  id: string;
  title: string;
  hook: string;
  script: string;
  shot_list: string[];
  cta: string;
  created_at: string;
  updated_at: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}
