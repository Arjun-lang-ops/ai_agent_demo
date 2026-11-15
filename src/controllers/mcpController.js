import { z } from "zod";

import {
  getAvailableTools,
  callMcpTool
} from "../services/mcpClientService.js";

export const getToolsController = async (req, res) => {

  const tools = await getAvailableTools();

  res.status(200).json({

    success: true,

    tools

  });

};


export const searchDocumentsController = async (req, res) => {

  const schema = z.object({

    query: z.string().min(2).max(2000),

    documentId: z.string().optional(),

    limit: z.number().int().min(1).max(10).default(5)

  });

  const validation = schema.safeParse(req.body);

  if (!validation.success) {

    return res.status(400).json({

      success: false,

      errors: validation.error.issues

    });

  }

  const { query, documentId, limit } = validation.data;

  const result = await callMcpTool("search_documents", {

    query,

    tenantId: req.tenantId,

    documentId,

    limit

  });

  res.status(200).json({

    success: true,

    data: result

  });

};


export const listDocumentsController = async (req, res) => {

  const result = await callMcpTool("list_documents", {

    tenantId: req.tenantId

  });

  res.status(200).json({

    success: true,

    data: result

  });

};