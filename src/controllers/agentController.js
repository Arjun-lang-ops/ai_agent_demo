import { z } from "zod";

import { runRagAgent } from "../services/agentService.js";

export const runAgentController = async (req, res) => {

  const schema = z.object({

    query: z.string().min(2).max(2000),

    documentId: z.string().optional()

  });

  const validation = schema.safeParse(req.body);

  if (!validation.success) {

    return res.status(400).json({
      success: false,
      errors: validation.error.issues
    });

  }

  const { query, documentId } = validation.data;

  const result = await runRagAgent({

    query,

    tenantId: req.tenantId,

    documentId

  });

  return res.status(200).json({

    success: true,

    message: "Agent workflow completed",

    data: result

  });

};