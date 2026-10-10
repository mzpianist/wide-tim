import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: "https://widetim.com",
  trailingSlash: "ignore",
  integrations: [sitemap()],
});
