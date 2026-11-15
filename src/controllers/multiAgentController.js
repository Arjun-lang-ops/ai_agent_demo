import { runMultiAgentSystem } from "../services/multiAgentService.js";

export const runMultiAgentController = async (req, res) => {

  // Get validated data from inputGuardrail middleware
  const { query, documentId } = req.validatedInput;

  const result = await runMultiAgentSystem({

    query,

    tenantId: req.tenantId,

    documentId

  });

  return res.status(200).json({

    success: true,

    message: "Multi-agent workflow completed",

    data: result

  });

};