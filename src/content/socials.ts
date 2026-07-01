// =============================================================================
// SOCIAL MEDIA LINKS
// Add/remove entries to update the Social page and footer.
// =============================================================================

export type SocialLink = {
  platform: string;
  handle: string;
  url: string;
};

export const socials: SocialLink[] = [
  {
    platform: "Instagram",
    handle: "@wide_tim",
    url: "https://www.instagram.com/wide_tim",
  },
  // Add more: { platform: "TikTok", handle: "@wide_tim", url: "..." },
];

export const primaryContactEmail = "wide-tim@mit.edu";
