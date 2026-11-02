import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import skillText from "./SKILL.md";
import { createMcpServer } from "./create-server.mjs";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Accept, MCP-Protocol-Version, MCP-Session-Id, Last-Event-ID",
  "Access-Control-Expose-Headers": "Mcp-Protocol-Version"
};

function withCors(response) {
  const headers = new Headers(response.headers);
  for (const [name, value] of Object.entries(corsHeaders)) {
    headers.set(name, value);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === "/health" && request.method === "GET") {
      return Response.json({ status: "ok", service: "universal-social-auth-mcp" }, { headers: corsHeaders });
    }

    if (url.pathname !== "/mcp") {
      return Response.json({ error: "Not found" }, { status: 404 });
    }

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    const server = createMcpServer(skillText);
    const transport = new WebStandardStreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true,
      maxRequestBodySize: 128 * 1024
    });

    try {
      await server.connect(transport);
      return withCors(await transport.handleRequest(request));
    } catch {
      return Response.json({ error: "MCP request failed" }, { status: 500, headers: corsHeaders });
    } finally {
      await server.close();
    }
  }
};
