/** Typed wrappers around the script endpoints (docs/API.md). */
import { api, ApiError } from "./api-client";
import type { Script } from "./types";

/** Get a project's script, or null if none has been generated yet. */
export async function getScript(projectId: string): Promise<Script | null> {
  try {
    return await api.get<Script>(`/projects/${projectId}/script/`);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

/** Generate (or regenerate) a project's script from a prompt. */
export function generateScript(projectId: string, prompt: string) {
  return api.post<Script>(`/projects/${projectId}/script/generate/`, {
    json: { prompt },
  });
}
