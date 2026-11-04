import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { SiteConfig } from "vitepress";

export const SITE_URL = "https://usa.zintrust.com";
export const SITE_NAME = "universal-social-auth";
export const SITE_DESCRIPTION =
  "Universal social login for the browser: OAuth 1.0, OAuth 2.0, and OIDC with PKCE, state checks, and lifecycle hooks. Your backend keeps the client secret.";
export const BRAND_COLOR = "#6b3dff";
export const OG_IMAGE = `${SITE_URL}/og-image.png`;

type Frontmatter = { title?: string; description?: string };

export function parseFrontmatter(source: string): { data: Frontmatter; body: string } {
  const match = source.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!match) return { data: {}, body: source };
  const data: Frontmatter = {};
  for (const line of match[1].split("\n")) {
    const kv = line.match(/^(title|description):\s*(.*)$/);
    if (kv) data[kv[1] as keyof Frontmatter] = kv[2].replace(/^["']|["']$/g, "");
  }
  return { data, body: source.slice(match[0].length) };
}

export function describePage(data: Frontmatter, body: string): string {
  if (data.description) return data.description;
  const blocks = body.replace(/```[\s\S]*?```/g, "").split(/\n\s*\n/);
  const paragraph = blocks
    .map((block) => block.split("\n").map((line) => line.trim()).join(" ").trim())
    .find((block) => block && !/^(#|\||[-*>]|\d+\.|<|---)/.test(block));
  if (!paragraph) return SITE_DESCRIPTION;
  const plain = paragraph.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/[`*_]/g, "").replace(/\s+/g, " ");
  if (plain.length <= 160) return plain;
  return `${plain.slice(0, 157).replace(/\s+\S*$/, "")}...`;
}

export function pageUrl(relativePath: string): string {
  const clean = relativePath.replace(/index\.md$/, "").replace(/\.md$/, "");
  return `${SITE_URL}/${clean}`.replace(/\/$/, "") || SITE_URL;
}

export function buildPageHead(relativePath: string, frontmatter: Frontmatter) {
  const title = frontmatter.title ? `${frontmatter.title} | ${SITE_NAME}` : `${SITE_NAME} | Social login for the browser`;
  const description = frontmatter.description ?? SITE_DESCRIPTION;
  const url = pageUrl(relativePath);
  return [
    ["link", { rel: "canonical", href: url }],
    ["meta", { property: "og:type", content: url === SITE_URL ? "website" : "article" }],
    ["meta", { property: "og:site_name", content: SITE_NAME }],
    ["meta", { property: "og:title", content: title }],
    ["meta", { property: "og:description", content: description }],
    ["meta", { property: "og:url", content: url }],
    ["meta", { property: "og:image", content: OG_IMAGE }],
    ["meta", { property: "og:image:width", content: "1200" }],
    ["meta", { property: "og:image:height", content: "630" }],
    ["meta", { property: "og:locale", content: "en_US" }],
    ["meta", { name: "twitter:card", content: "summary_large_image" }],
    ["meta", { name: "twitter:title", content: title }],
    ["meta", { name: "twitter:description", content: description }],
    ["meta", { name: "twitter:image", content: OG_IMAGE }],
  ] as const;
}

export const siteHead = [
  ["link", { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32.png" }],
  ["link", { rel: "icon", type: "image/png", sizes: "16x16", href: "/favicon-16.png" }],
  ["link", { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" }],
  ["link", { rel: "manifest", href: "/site.webmanifest" }],
  ["meta", { name: "theme-color", content: BRAND_COLOR }],
  ["meta", { name: "author", content: "Diadal Nigeria Limited" }],
  ["meta", { name: "keywords", content: "OAuth, OAuth 2.0, OAuth 1.0, OpenID Connect, OIDC, PKCE, social login, Google login, GitHub login, Laravel, Express, Zintrust, Keycloak, Okta, Entra ID" }],
  ["script", { type: "application/ld+json" }, JSON.stringify(organizationJsonLd())],
  ["script", { type: "application/ld+json" }, JSON.stringify(softwareJsonLd())],
] as const;

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Diadal Nigeria Limited",
    url: "https://zintrust.com",
    logo: `${SITE_URL}/logo.png`,
    sameAs: ["https://github.com/diadal", "https://github.com/sponsors/diadal", "https://patreon.com/diadal"],
  };
}

export function softwareJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Any (browser, Node.js >= 20.19)",
    license: "https://opensource.org/licenses/MIT",
    codeRepository: "https://github.com/diadal/universal-social-auth",
    downloadUrl: "https://www.npmjs.com/package/universal-social-auth",
    programmingLanguage: "TypeScript",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    author: { "@type": "Organization", name: "Diadal Nigeria Limited", url: "https://zintrust.com" },
  };
}

export function faqItemsFromBody(body: string): { question: string; answer: string }[] {
  const items: { question: string; answer: string }[] = [];
  for (const section of body.split(/^### /m).slice(1)) {
    const [question, ...rest] = section.split("\n");
    const answer = rest
      .join(" ")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/`/g, "")
      .replace(/\s+/g, " ")
      .trim();
    if (question && answer) items.push({ question: question.trim(), answer });
  }
  return items;
}

export function faqJsonLd(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

function collectPages(siteConfig: SiteConfig) {
  return siteConfig.pages
    .filter((p) => p.endsWith(".md") && !p.startsWith("node_modules") && p !== "404.md")
    .map((relativePath) => {
      const source = readFileSync(join(siteConfig.srcDir, relativePath), "utf8");
      const { data, body } = parseFrontmatter(source);
      const title = data.title ?? body.match(/^#\s+(.+)$/m)?.[1] ?? relativePath;
      return { relativePath, title, description: describePage(data, body), body, url: pageUrl(relativePath) };
    })
    .sort((a, b) => a.url.localeCompare(b.url));
}

const ROBOTS = `User-agent: *
Allow: /

# AI crawlers are welcome: the docs are meant to be cited accurately.
User-agent: GPTBot
Allow: /
User-agent: ClaudeBot
Allow: /
User-agent: PerplexityBot
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`;

export function writeSeoFiles(siteConfig: SiteConfig) {
  const out = siteConfig.outDir;
  const pages = collectPages(siteConfig);

  writeFileSync(join(out, "robots.txt"), ROBOTS);

  const sections = pages
    .filter((p) => p.relativePath !== "index.md")
    .map((p) => `- [${p.title}](${p.url}): ${p.description}`)
    .join("\n");
  writeFileSync(
    join(out, "llms.txt"),
    `# ${SITE_NAME}\n\n> ${SITE_DESCRIPTION}\n\nPublisher: Diadal Nigeria Limited. Source: https://github.com/diadal/universal-social-auth. Package: https://www.npmjs.com/package/universal-social-auth. License: MIT.\n\n## Docs\n\n${sections}\n\n## Optional\n\n- [Full documentation as one file](${SITE_URL}/llms-full.txt)\n- [Sponsor this project](${SITE_URL}/sponsor)\n`
  );

  const full = pages
    .map((p) => `# ${p.title}\n\nSource: ${p.url}\n\n${p.body.trim()}\n`)
    .join("\n---\n\n");
  writeFileSync(join(out, "llms-full.txt"), `# ${SITE_NAME}\n\n> ${SITE_DESCRIPTION}\n\n${full}`);

  writeFileSync(
    join(out, "site.webmanifest"),
    JSON.stringify(
      {
        name: SITE_NAME,
        short_name: SITE_NAME,
        description: SITE_DESCRIPTION,
        start_url: "/",
        display: "standalone",
        background_color: "#1a1b4d",
        theme_color: BRAND_COLOR,
        icons: [
          { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
        ],
      },
      null,
      2
    )
  );

  console.log(`SEO: ${pages.length} pages written to robots.txt, llms.txt, llms-full.txt, site.webmanifest`);
}
