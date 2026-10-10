// =============================================================================
// "BEING WIDE (2024)" PAGE
// The text lives in `beingWide.json`; edit it with the local editor
// (`npm run editor`, or the "Wide Tim Editor" shortcut on the Desktop).
// For Instagram reels, `videoEmbedUrl` is the permalink (e.g.
// https://www.instagram.com/reel/XXXX/); for YouTube, the /embed/ URL.
// =============================================================================

import data from "./beingWide.json";

export const beingWide = {
  ...data,
  videoProvider: data.videoProvider as "instagram" | "youtube" | "vimeo" | "",
};
