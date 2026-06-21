/**
 * Decorative page background: a faint dot grid masked to fade toward the edges,
 * plus two soft brand-colored glows. Purely cosmetic (aria-hidden, no interaction).
 *
 * Render as the first child of a `relative isolate overflow-hidden` container.
 */
export function BackgroundTexture() {
  return (
    <>
      {/* Faint dot grid, masked to fade toward the edges. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.2)_1px,transparent_1px)] bg-size-[22px_22px] mask-[radial-gradient(ellipse_at_center,black_30%,transparent_75%)]"
      />
      {/* Brand glows. */}
      <div
        aria-hidden
        className="pointer-events-none absolute right-[-5%] top-0 -z-10 h-115 w-115 -translate-x-1/2 rounded-full bg-primary/10 blur-[150px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[-50%] left-[15%] -z-10 h-191 w-191 -translate-x-1/2 rounded-full bg-primary/10 blur-[250px]"
      />
    </>
  );
}
