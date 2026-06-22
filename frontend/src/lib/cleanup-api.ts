/** Typed wrappers around the auto-cleanup endpoints (docs/API.md). */
import { api } from "./api-client";
import type { CleanupState } from "./types";

export function getCleanup(projectId: string) {
  return api.get<CleanupState>(`/projects/${projectId}/cleanup/`);
}

export function removeSilence(projectId: string) {
  return api.post<CleanupState>(`/projects/${projectId}/cleanup/silence/`, {});
}

export function removeBreaths(projectId: string) {
  return api.post<CleanupState>(`/projects/${projectId}/cleanup/breaths/`, {});
}

/** Undo all cleanup for the project. */
export function clearCleanup(projectId: string) {
  return api.delete<CleanupState>(`/projects/${projectId}/cleanup/`);
}
