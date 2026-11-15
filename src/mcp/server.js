import "dotenv/config";

import mongoose from "mongoose";

import { McpServer } from "@modelcontextprotocol/server";

import { serveStdio } from "@modelcontextprotocol/server/stdio";

import * as z from "zod/v4";

import Document from "../models/Document.js";

import { hybridSearch } from "../services/hybridSearchService.js";

await mongoose.connect(process.env.MONGODB_URI);

const server = new McpServer({
  name: "enterprise-knowledge-server",
  version: "1.0.0"
});

server.registerTool(

  "search_documents",

  {
    description:
      "Search company documents using hybrid vector and keyword search.",

    inputSchema: z.object({

      query: z.string().min(2).max(2000),

      tenantId: z.string(),

      documentId: z.string().optional(),

      limit: z.number().int().min(1).max(10).default(5)

    })

  },

  async ({ query, tenantId, documentId, limit }) => {

    const chunks = await hybridSearch({

      query,

      tenantId,

      documentId,

      limit

    });

    return {

      content: [
        {
          type: "text",

          text: JSON.stringify(chunks)
        }
      ]

    };

  }

);


server.registerTool(

  "list_documents",

  {
    description:
      "List uploaded documents belonging to an organization.",

    inputSchema: z.object({

      tenantId: z.string()

    })

  },

  async ({ tenantId }) => {

    const documents = await Document.find({

      tenantId

    })
      .select("originalName mimeType fileSize status createdAt")
      .sort({ createdAt: -1 })
      .lean();

    return {

      content: [
        {
          type: "text",

          text: JSON.stringify(documents)
        }
      ]

    };

  }

);

serveStdio(() => server);