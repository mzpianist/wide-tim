// =============================================================================
// "CONTACT" PAGE
// The text lives in `contact.json`; edit it with the local editor
// (`npm run editor`, or the "Wide Tim Editor" shortcut on the Desktop).
// `collabCallout` is the box for serious collaboration inquiries; `methods`
// are the contact cards. `copy: true` shows a small "Copy" button on a card.
// =============================================================================

import data from "./contact.json";

export type ContactMethod = {
  label: string;
  value: string;
  url?: string;
  copy?: boolean;
};

export const contact: typeof data & { methods: ContactMethod[] } = data;
