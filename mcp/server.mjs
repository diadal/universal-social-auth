#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { Providers } from "universal-social-auth/dist/providers/index.mjs";
import { z } from "zod";

const skillUrl = new URL("../skills/universal-social-auth/SKILL.md", import.meta.url);
const skillText = await readFile(fileURLToPath(skillUrl), "utf8");

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

const transport = new StdioServerTransport();
await server.connect(transport);
