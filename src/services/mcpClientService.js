import { Client } from "@modelcontextprotocol/client";

import { StdioClientTransport } from "@modelcontextprotocol/client/stdio";

import { fileURLToPath } from "url";

let client;

let transport;

const allowedTools = new Set([

  "search_documents",

  "list_documents"

]);

export const connectMcpClient = async () => {

  if (client) {
    return client;
  }

  client = new Client({

    name: "enterprise-ai-platform",

    version: "1.0.0"

  });

  const serverPath = fileURLToPath(
    new URL("../mcp/server.js", import.meta.url)
  );

  transport = new StdioClientTransport({

    command: process.execPath,

    args: [serverPath]

  });

  await client.connect(transport);

  console.error("MCP Client connected successfully");

  return client;

};

export const getAvailableTools = async () => {

  if (!client) {
    throw new Error("MCP Client is not connected");
  }

  const result = await client.listTools();

  return result.tools;

};

export const callMcpTool = async (name, args) => {

  if (!client) {

    throw new Error("MCP Client is not connected");

  }

  if (!allowedTools.has(name)) {

    throw new Error("Tool is not allowed");

  }

  if (!args || typeof args !== "object") {

    throw new Error("Invalid tool arguments");

  }

  const result = await client.callTool({

    name,

    arguments: args

  });

  if (result.isError) {

    throw new Error("MCP tool execution failed");

  }

  return result;

};

export const closeMcpClient = async () => {

  if (client) {

    await client.close();

    client = undefined;

    transport = undefined;

  }

};