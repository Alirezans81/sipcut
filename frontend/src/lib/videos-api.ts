/** Typed wrappers around the video clip endpoints (docs/API.md). */
import { api } from "./api-client";
import type { Video } from "./types";

export function listVideos(projectId: string) {
  return api.get<Video[]>(`/projects/${projectId}/videos/`);
}

/** Upload a clip (multipart). Optionally pass a display name and known duration. */
export function uploadVideo(
  projectId: string,
  file: File | Blob,
  opts: { name?: string; duration?: number } = {},
) {
  const formData = new FormData();
  // The multipart filename must keep a valid extension (the backend validates it),
  // independent of the user-facing display name. Camera blobs have no filename.
  let filename: string;
  if (file instanceof File) {
    filename = file.name;
  } else {
    const ext = file.type.includes("mp4") ? "mp4" : "webm";
    filename = `recording-${Date.now()}.${ext}`;
  }
  formData.append("file", file, filename);
  if (opts.name) formData.append("name", opts.name);
  if (opts.duration != null) formData.append("duration", String(opts.duration));
  return api.post<Video>(`/projects/${projectId}/videos/`, { formData });
}

export function renameVideo(projectId: string, videoId: string, name: string) {
  return api.patch<Video>(`/projects/${projectId}/videos/${videoId}/`, {
    json: { name },
  });
}

export function deleteVideo(projectId: string, videoId: string) {
  return api.delete<void>(`/projects/${projectId}/videos/${videoId}/`);
}

/** Persist a new clip order. `videoIds` must be the full set in desired order. */
export function reorderVideos(projectId: string, videoIds: string[]) {
  return api.post<Video[]>(`/projects/${projectId}/videos/reorder/`, {
    json: { video_ids: videoIds },
  });
}
