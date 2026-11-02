# MCP server

This standalone MCP server helps AI clients inspect built-in provider metadata
and retrieve integration guidance. It does not run OAuth flows, handle user
sessions, exchange authorization codes, or read application credentials.

## Requirements

- Node.js 18 or newer
- A compatible MCP client

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

## Tools and resources

- `list_providers`: returns built-in provider IDs, OAuth versions, and authorization endpoints.
- `get_provider_config`: returns the public default configuration for a provider. Unknown provider IDs return an MCP error.
- `get_integration_guide`: returns framework-specific setup steps and guidance for Laravel Socialite or a custom backend.
- `universal-social-auth://skill`: provides the complete agent skill as Markdown.

Provider values come from the package's exported provider catalog. Supply
project-specific client IDs, redirect URIs, and scopes in the application;
never send client secrets to this MCP server or embed them in frontend code.
