import { z } from "zod";

import {
  generateRagAnswer
} from "../services/ragService.js";


const ragSchema = z.object({

  query: z.string().trim().min(2).max(2000),

  limit: z.coerce.number().int().min(1).max(10).default(5),

  documentId: z.string().optional()

});


const askRagController = async (req, res) => {


  // STEP 1: Validate request
  const validation = ragSchema.safeParse(req.body);


  if (!validation.success) {

    return res.status(400).json({

      success: false,

      message: "Invalid RAG request.",

      errors: validation.error.flatten()

    });

  }


  const {

    query,

    limit,

    documentId

  } = validation.data;


  // STEP 2: Generate RAG answer
  const result = await generateRagAnswer({

    query,

    tenantId: req.tenantId,

    limit,

    documentId

  });


  // STEP 3: Return response
  return res.status(200).json({

    success: true,

    message: "RAG answer generated successfully.",

    data: result

  });

};


export {
  askRagController
};