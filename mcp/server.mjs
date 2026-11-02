#!/usr/bin/env node
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { readFile } from "node:fs/promises";
import { createMcpServer } from "./create-server.mjs";

const skillText = await readFile(new URL("./SKILL.md", import.meta.url), "utf8");
const server = createMcpServer(skillText);

const transport = new StdioServerTransport();
await server.connect(transport);
