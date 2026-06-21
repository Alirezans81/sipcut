/** Typed wrappers around the project endpoints (docs/API.md). */
import { api } from "./api-client";
import type { Project } from "./types";

/** List the current user's projects (newest first). */
export function listProjects() {
  return api.get<Project[]>("/projects/");
}

/** Create a project. Returns it in DRAFT status. */
export function createProject(title: string) {
  return api.post<Project>("/projects/", { json: { title } });
}

/** Retrieve a single project the user owns. */
export function getProject(id: string) {
  return api.get<Project>(`/projects/${id}/`);
}

/** Delete a project the user owns. */
export function deleteProject(id: string) {
  return api.delete<void>(`/projects/${id}/`);
}
