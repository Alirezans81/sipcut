/** Typed wrappers around the subtitle endpoints (docs/API.md). */
import { api } from "./api-client";
import type { SubtitleState } from "./types";

export function getSubtitles(projectId: string) {
  return api.get<SubtitleState>(`/projects/${projectId}/subtitles/`);
}

export function generateSubtitles(projectId: string, preset: string) {
  return api.post<SubtitleState>(`/projects/${projectId}/subtitles/generate/`, {
    json: { preset },
  });
}
