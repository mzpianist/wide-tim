// =============================================================================
// SOCIAL MEDIA LINKS
// Listed in `socials.json`, shown in the footer. Edit them with the local
// editor (`npm run editor`, or the "Wide Tim Editor" shortcut on the Desktop).
// =============================================================================

import data from "./socials.json";

export type SocialLink = {
  platform: string;
  handle: string;
  url: string;
};

export const socials: SocialLink[] = data;
