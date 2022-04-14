import { defineConfig } from "astro/config";
import preact from "@astrojs/preact";

export default defineConfig({
  site: "https://sadh.life",
  integrations: [preact()],
  markdown: {
    // TODO: switch to shiki
    syntaxHighlight: "prism",
    rehypePlugins: ["rehype-autolink-headings"],
  },
});
