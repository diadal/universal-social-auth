import { defineConfig } from "vitepress";

export default defineConfig({
  title: "universal-social-auth",
  description: "Universal social login for the browser: OAuth 1.0, OAuth 2.0, and OIDC with PKCE.",
  outDir: "../dist",
  cleanUrls: true,
  lastUpdated: false,
  themeConfig: {
    nav: [
      { text: "Guide", link: "/getting-started" },
      { text: "Recipes", link: "/docs/recipes/express" },
      { text: "Frameworks", link: "/docs/frameworks/nuxt" },
      { text: "Sponsor", link: "/sponsor" }
    ],
    sidebar: [
      {
        text: "Guide",
        items: [
          { text: "Getting started", link: "/getting-started" },
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
      }
    ],
    socialLinks: [
      { icon: "github", link: "https://github.com/diadal/universal-social-auth" },
      { icon: "npm", link: "https://www.npmjs.com/package/universal-social-auth" }
    ],
    search: { provider: "local" }
  }
});
