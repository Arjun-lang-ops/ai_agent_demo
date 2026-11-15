import { z } from "zod";

import {
  hybridSearch
} from "../services/hybridSearchService.js";


const hybridSearchSchema = z.object({

  query: z.string().trim().min(2).max(2000),

  limit: z.coerce.number().int().min(1).max(20).default(5),

  documentId: z.string().optional()

});


const hybridSearchController = async (req, res) => {

  // Validate request
  const validation = hybridSearchSchema.safeParse(req.body);


  if (!validation.success) {

    return res.status(400).json({

      success: false,

      message: "Invalid search request.",

      errors: validation.error.flatten()

    });

  }


  const {
    query,
    limit,
    documentId
  } = validation.data;


  // Perform hybrid search
  const results = await hybridSearch({

    query,

    tenantId: req.tenantId,

    limit,

    documentId

  });


  return res.status(200).json({

    success: true,

    message: "Hybrid search completed successfully.",

    totalResults: results.length,

    results

  });

};


export {
  hybridSearchController
};