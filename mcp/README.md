# MCP server

This MCP server helps AI clients inspect built-in provider metadata and retrieve
integration guidance. It does not run OAuth flows, handle user sessions,
exchange authorization codes, or read application credentials.

## Requirements

- Node.js 18 or newer
- A compatible MCP client

## Install from npm

```sh
npm install --global universal-social-auth-mcp
```

Configure an MCP client to launch `universal-social-auth-mcp` as a stdio
server. The package includes the skill resource and requires no credentials.

## Run from this repository

```sh
cd mcp
npm install
npm start
```

Configure the MCP client to launch the server with Node. Use the absolute path
to this repository's `mcp/server.mjs`:

```json
{
  "mcpServers": {
    "universal-social-auth": {
      "command": "node",
      "args": ["/absolute/path/to/universal-social-auth/mcp/server.mjs"]
    }
  }
}
```

The server resolves its dependencies relative to the `mcp` directory. Run
`npm install` there before starting it. No provider secrets or environment
variables are needed.

## Cloudflare Worker

The Streamable HTTP endpoint is deployed to `https://usa-mcp.diadal.com.ng/mcp`.
The server is stateless and read-only; it requires no Durable Object or secret.
The custom domain must be an active Cloudflare zone with no conflicting DNS
record. Wrangler manages the DNS record and certificate for the custom domain.

Use Node.js 22 or newer for the Wrangler deployment toolchain. From the
repository's `mcp` directory, install dependencies, validate the Worker bundle,
then deploy:

```sh
npm install
npm run deploy:dry-run
npm run deploy
```

The same MCP tools and skill resource are available on the HTTP endpoint and
the stdio server. `GET /health` is a lightweight health check. MCP clients
should connect to `https://usa-mcp.diadal.com.ng/mcp` using Streamable HTTP.
This endpoint is intentionally public and unauthenticated because its tools
only return public package metadata and documentation.

## Tools and resources

- `list_providers`: returns built-in provider IDs, OAuth versions, and authorization endpoints.
- `get_provider_config`: returns the public default configuration for a provider. Unknown provider IDs return an MCP error.
- `get_integration_guide`: returns framework-specific setup steps and guidance for Laravel Socialite or a custom backend.
- `universal-social-auth://skill`: provides the complete agent skill as Markdown.

Provider values come from the package's exported provider catalog. Supply
project-specific client IDs, redirect URIs, and scopes in the application;
never send client secrets to this MCP server or embed them in frontend code.
