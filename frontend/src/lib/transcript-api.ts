/** Typed wrappers around the transcript editor endpoints (docs/API.md). */
import { api } from "./api-client";
import type { Transcript } from "./types";

/** A single segment change. Only text and deleted are editable. */
export interface SegmentEdit {
  id: string;
  text?: string;
  deleted?: boolean;
}

export function getTranscript(projectId: string) {
  return api.get<Transcript>(`/projects/${projectId}/transcript/`);
}

/** Persist segment edits; returns the updated transcript. */
export function updateTranscript(projectId: string, segments: SegmentEdit[]) {
  return api.patch<Transcript>(`/projects/${projectId}/transcript/`, {
    json: { segments },
  });
}
