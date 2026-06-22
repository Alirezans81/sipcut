/** Typed wrappers around the processing pipeline endpoints (docs/API.md). */
import { api } from "./api-client";
import type { ProcessingState } from "./types";

/** Kick off merge + transcript generation. Returns the initial processing state. */
export function startProcessing(projectId: string) {
  return api.post<ProcessingState>(`/projects/${projectId}/process/`, {});
}

/** Poll the pipeline: current status plus the timeline once it's ready. */
export function getProcessing(projectId: string) {
  return api.get<ProcessingState>(`/projects/${projectId}/processing/`);
}
