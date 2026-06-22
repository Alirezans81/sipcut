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

export interface Video {
  id: string;
  name: string;
  url: string;
  duration: number;
  order: number;
  created_at: string;
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

/** A line of transcript tied to a span of the merged source video (Epic 6). */
export interface TranscriptSegment {
  id: string;
  text: string;
  start_time: number;
  end_time: number;
  deleted: boolean;
  order: number;
}

export interface SourceVideo {
  url: string;
  duration: number;
}

/** The editor read model: merged video plus its ordered transcript segments. */
export interface Timeline {
  duration: number;
  source_video: SourceVideo | null;
  segments: TranscriptSegment[];
}

/** Full transcript with its segments — the editable source of truth (Epic 7). */
export interface Transcript {
  id: string;
  created_at: string;
  segments: TranscriptSegment[];
}

/** A time region cut by auto-cleanup — a silence or a long breath (Epic 9). */
export interface CleanupOperation {
  id: string;
  type: "silence" | "breath";
  start_time: number;
  end_time: number;
  created_at: string;
}

export interface CleanupSummary {
  silence_count: number;
  breath_count: number;
  total_seconds: number;
}

export interface CleanupState {
  operations: CleanupOperation[];
  summary: CleanupSummary;
}

/** A subtitle style preset and its render attributes (Epic 10). */
export interface SubtitlePreset {
  preset: string;
  label: string;
  font_size: number; // cqw units — scales with the preview frame
  font_weight: number;
  text_color: string;
  outline_color: string;
  background: string;
  position: "bottom" | "center";
}

export interface SubtitleTrack {
  preset: string;
  style: SubtitlePreset;
  url: string | null;
  created_at: string;
}

export interface SubtitleState {
  presets: SubtitlePreset[];
  subtitle: SubtitleTrack | null;
}

export interface ProcessingState {
  status: ProjectStatus;
  timeline: Timeline;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}
