/** Client-side media helpers. */

/** Read a video's duration (seconds) in the browser, without uploading first. */
export function readVideoDuration(blob: Blob): Promise<number> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(blob);
    const video = document.createElement("video");
    video.preload = "metadata";
    const done = (value: number) => {
      URL.revokeObjectURL(url);
      resolve(Number.isFinite(value) ? value : 0);
    };
    video.onloadedmetadata = () => done(video.duration);
    video.onerror = () => done(0);
    video.src = url;
  });
}

/** Format seconds as m:ss (e.g. 75 → "1:15"). */
export function formatDuration(seconds: number): string {
  if (!seconds || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
