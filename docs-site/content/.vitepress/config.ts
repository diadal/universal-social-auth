import { defineConfig } from "vitepress";
import {
  SITE_DESCRIPTION,
  SITE_URL,
  buildPageHead,
  describePage,
  faqItemsFromBody,
  faqJsonLd,
  parseFrontmatter,
  siteHead,
  writeSeoFiles
} from "./seo";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const srcDir = join(dirname(fileURLToPath(import.meta.url)), "..");

export default defineConfig({
  title: "universal-social-auth",
  description: SITE_DESCRIPTION,
  outDir: "../dist",
  cleanUrls: true,
  lastUpdated: false,
  sitemap: { hostname: SITE_URL },
  head: [...siteHead],
  transformPageData(pageData) {
    const { data, body } = parseFrontmatter(readFileSync(join(srcDir, pageData.filePath), "utf8"));
    const description = describePage(data, body);
    pageData.description = description;
    const head = [...buildPageHead(pageData.relativePath, { ...pageData.frontmatter, description })];
    if (pageData.relativePath === "faq.md") {
      head.push(["script", { type: "application/ld+json" }, JSON.stringify(faqJsonLd(faqItemsFromBody(body)))] as const);
    }
    pageData.frontmatter.head = [...(pageData.frontmatter.head ?? []), ...head];
  },
  buildEnd(siteConfig) {
    writeSeoFiles(siteConfig);
  },
  themeConfig: {
    nav: [
      { text: "Guide", link: "/getting-started" },
      { text: "Recipes", link: "/docs/recipes/express" },
      { text: "Frameworks", link: "/docs/frameworks/nuxt" },
      { text: "FAQ", link: "/faq" },
      { text: "Sponsor", link: "/sponsor" },
      { text: "Zintrust", link: "https://zintrust.com" }
    ],
    sidebar: [
      {
        text: "Guide",
        items: [
          { text: "Getting started", link: "/getting-started" },
          { text: "FAQ", link: "/faq" },
          { text: "Lifecycle hooks", link: "/docs/lifecycle" },
          { text: "Accessibility", link: "/docs/accessibility" }
        ]
      },
      {
        text: "Backend recipes",
        items: [
          { text: "Express", link: "/docs/recipes/express" },
          { text: "Laravel", link: "/docs/recipes/laravel" },
          { text: "Zintrust", link: "/docs/recipes/zintrust" },
          { text: "Other backends", link: "/docs/recipes/other-backends" },
          { text: "Okta, Entra ID, Keycloak", link: "/docs/recipes/okta-entra-keycloak" },
          { text: "SAML", link: "/docs/recipes/saml" }
        ]
      },
      {
        text: "Frameworks",
        items: [
          { text: "Nuxt", link: "/docs/frameworks/nuxt" },
          { text: "Angular", link: "/docs/frameworks/angular" },
          { text: "Capacitor", link: "/docs/frameworks/capacitor" }
        ]
      },
      {
        text: "Support",
        items: [{ text: "Sponsor this project", link: "/sponsor" }]
      },
      {
        text: "Legal and contact",
        items: [
          { text: "Contact", link: "/contact" },
          { text: "Terms and Conditions", link: "/terms" },
          { text: "Privacy Policy", link: "/privacy" }
        ]
      }
    ],
    footer: {
      message: "Released under the MIT License. Published by Diadal Nigeria Limited. Part of the Zintrust ecosystem at zintrust.com.",
      copyright: "© 2026 Diadal Nigeria Limited"
    },
    socialLinks: [
      { icon: "github", link: "https://github.com/diadal/universal-social-auth" },
      { icon: "npm", link: "https://www.npmjs.com/package/universal-social-auth" }
    ],
    search: { provider: "local" }
  }
});
