import { readFileSync } from "node:fs";
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

// Pages set to "Link only" or "Off" (src/content/pages.json) stay out of the
// sitemap, like they stay out of the menu.
const visibility = JSON.parse(readFileSync(new URL("./src/content/pages.json", import.meta.url), "utf8"));
const isShown = (url) => (visibility[new URL(url).pathname.replace(/\/+$/, "") || "/"] ?? "shown") === "shown";

// https://astro.build/config
export default defineConfig({
  site: "https://widetim.com",
  trailingSlash: "ignore",
  integrations: [sitemap({ filter: isShown })],
});
