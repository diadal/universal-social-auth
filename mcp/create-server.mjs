import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Providers } from "universal-social-auth/dist/providers/index.mjs";
import { z } from "zod";
import catalog from "./provider-catalog.json" with { type: "json" };

const DOCS_BASE = "https://universal-social-auth-docs.zupago.workers.dev/docs";

const RECIPES = {
  express: { title: "Express", path: "/recipes/express", summary: "Exchange the code in an Express route; keep the client secret server-side." },
  laravel: { title: "Laravel", path: "/recipes/laravel", summary: "POST the code to a controller and exchange it with Laravel's HTTP client." },
  zintrust: { title: "Zintrust", path: "/recipes/zintrust", summary: "Use router.post and a sealed controller to exchange the code." },
  "other-backends": { title: "Other backends", path: "/recipes/other-backends", summary: "The request contract and server checklist for any backend." },
  "okta-entra-keycloak": { title: "Okta, Entra ID, Keycloak", path: "/recipes/okta-entra-keycloak", summary: "OIDC issuer settings and ID-token checks for each provider." },
  saml: { title: "SAML", path: "/recipes/saml", summary: "SAML is not supported in the browser. Server-side evaluation only." }
};

export function createMcpServer(skillText) {
  const server = new McpServer({
    name: "universal-social-auth",
    version: "0.1.0"
  });

  server.registerTool(
    "list_providers",
    {
      description: "List the built-in OAuth providers and their OAuth versions.",
      inputSchema: {}
    },
    async () => {
      const providers = Object.entries(Providers).map(([id, config]) => ({
        id,
        oauthType: config.oauthType,
        authorizationEndpoint: config.authorizationEndpoint || null
      }));

      return {
        content: [{ type: "text", text: JSON.stringify(providers, null, 2) }]
      };
    }
  );

  server.registerTool(
    "get_provider_config",
    {
      description:
        "Get public built-in configuration for one provider. Client secrets and app credentials are never returned.",
      inputSchema: { provider: z.string().min(1) }
    },
    async ({ provider }) => {
      const id = provider.toLowerCase();
      const config = Providers[id];
      if (!config) {
        return {
          isError: true,
          content: [{ type: "text", text: `Unknown provider: ${provider}` }]
        };
      }

      const publicConfig = {
        name: config.name,
        oauthType: config.oauthType,
        url: config.url,
        authorizationEndpoint: config.authorizationEndpoint,
        redirectUri: config.redirectUri,
        scope: config.scope,
        scopeDelimiter: config.scopeDelimiter,
        requiredUrlParams: config.requiredUrlParams,
        optionalUrlParams: config.optionalUrlParams,
        responseType: config.responseType,
        responseMode: config.responseMode,
        popupOptions: config.popupOptions
      };

      return {
        content: [{ type: "text", text: JSON.stringify(publicConfig, null, 2) }]
      };
    }
  );

  server.registerTool(
    "get_integration_guide",
    {
      description: "Get framework and backend integration steps, including the browser/backend security boundary.",
      inputSchema: {
        framework: z.enum(["vanilla", "vue2", "vue3", "nuxt", "react", "angular", "capacitor"]),
        backend: z.enum(["laravel-socialite", "custom"])
      }
    },
    async ({ framework, backend }) => {
      const frameworkNotes = {
        vanilla: "Create one UniversalSocialauth instance in the browser app.",
        vue2: "Register the instance on Vue.prototype and call authenticate from a component action.",
        vue3: "Provide the instance through app.provide or app.config.globalProperties.",
        nuxt: "Create the instance in a client-only plugin and invoke it only in the browser.",
        react: "Create the instance in a client-side module or provider and invoke it from a user event.",
        angular: "Wrap the instance in an injectable service and invoke it from a user event.",
        capacitor: "Use a deep link for the callback and relay the returned authorization code to the app."
      };
      const backendNotes = {
        "laravel-socialite":
          "Configure Laravel Socialite provider credentials server-side and implement the callback/code exchange endpoint.",
        custom: "Implement a server-side OAuth callback and code exchange using a maintained backend OAuth library."
      };

      const guide = [
        `# ${framework} integration`,
        "",
        "1. Install `universal-social-auth` and `axios` in the frontend project.",
        `2. ${frameworkNotes[framework]}`,
        "3. Create a UniversalSocialauth instance with your Axios instance and a providers configuration containing the provider client ID and redirect URI.",
        "4. Call `authenticate(provider, providerConfig)` directly from a user-initiated action, then handle the returned authorization response.",
        "5. Send the authorization code to your own backend over HTTPS and establish the application session there.",
        `6. ${backendNotes[backend]}`,
        "",
        "Security: keep client secrets on the server, validate OAuth state (and OIDC nonce where applicable), validate redirect URIs, and apply your own account-linking and CSRF protections. This package initiates the browser flow; it does not exchange authorization codes or create application sessions."
      ].join("\n");

      return { content: [{ type: "text", text: guide }] };
    }
  );

  server.registerTool(
    "validate_provider_config",
    {
      description:
        "Check a custom provider definition for structural problems (OAuth type, HTTPS endpoints, scope format). Read-only; returns field names and messages only, never echoes values.",
      inputSchema: {
        name: z.string().min(1),
        definition: z.record(z.string(), z.unknown())
      }
    },
    async ({ name, definition }) => {
      const issues = [];
      const add = (field, message) => issues.push({ field, message });

      if (definition.name !== name) add("name", "name must match the provider key");
      if (definition.oauthType !== "1.0" && definition.oauthType !== "2.0") {
        add("oauthType", 'oauthType must be "1.0" or "2.0"');
      }
      if (definition.authorizationEndpoint !== undefined) {
        const endpoint = String(definition.authorizationEndpoint);
        const isLocal = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/.test(endpoint);
        if (!endpoint.startsWith("https://") && !isLocal) {
          add("authorizationEndpoint", "authorizationEndpoint must use https (or localhost)");
        }
      }
      if (definition.redirectUri !== undefined && typeof definition.redirectUri !== "string") {
        add("redirectUri", "redirectUri must be a string");
      }
      if (definition.scope !== undefined) {
        const scopes = Array.isArray(definition.scope) ? definition.scope : [definition.scope];
        const valid = scopes.every(
          (s) => typeof s === "string" && s.length > 0 && !/\s/.test(s)
        );
        if (typeof definition.scope !== "string" && !Array.isArray(definition.scope)) {
          add("scope", "scope must be a string or an array of strings");
        } else if (!valid) {
          add("scope", "each scope must be a non-empty string without whitespace");
        }
      }

      const result = { provider: name, valid: issues.length === 0, issues };
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.registerTool(
    "get_recipe",
    {
      description:
        "Get the backend recipe summary and docs link for a server framework (read-only).",
      inputSchema: { recipe: z.enum(Object.keys(RECIPES)) }
    },
    async ({ recipe }) => {
      const entry = RECIPES[recipe];
      const text = [`# ${entry.title}`, "", entry.summary, "", `Docs: ${DOCS_BASE}${entry.path}`].join("\n");
      return { content: [{ type: "text", text }] };
    }
  );

  server.registerTool(
    "get_catalog_entry",
    {
      description:
        "Get a provider entry from the generated catalog (static fields only, no secrets). Read-only.",
      inputSchema: { provider: z.string().min(1) }
    },
    async ({ provider }) => {
      const entry = catalog.providers?.[provider.toLowerCase()];
      if (!entry) {
        return { isError: true, content: [{ type: "text", text: `No catalog entry for: ${provider}` }] };
      }
      return { content: [{ type: "text", text: JSON.stringify(entry, null, 2) }] };
    }
  );

  server.registerTool(
    "check_setup_keys",
    {
      description:
        "Given the names of environment variables you have set (never their values), report which required ones are missing for a backend recipe. Read-only.",
      inputSchema: {
        recipe: z.enum(["laravel", "zintrust", "express"]),
        presentKeys: z.array(z.string().min(1)).max(100)
      }
    },
    async ({ recipe, presentKeys }) => {
      const required = {
        laravel: ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET", "GOOGLE_REDIRECT_URI"],
        zintrust: ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"],
        express: ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"]
      }[recipe];
      const present = new Set(presentKeys);
      const missing = required.filter((key) => !present.has(key));
      const result = { recipe, complete: missing.length === 0, missing };
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.registerResource(
    "agent-skill",
    "universal-social-auth://skill",
    {
      description: "Full agent instructions for integrating and troubleshooting this library.",
      mimeType: "text/markdown"
    },
    async (uri) => ({
      contents: [{ uri: uri.href, mimeType: "text/markdown", text: skillText }]
    })
  );

  return server;
}
