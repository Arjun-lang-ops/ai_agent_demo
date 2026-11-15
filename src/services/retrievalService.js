import mongoose from "mongoose";

import DocumentChunk from "../models/DocumentChunk.js";

import {
  generateQueryEmbedding
} from "./embeddingService.js";


const VECTOR_INDEX_NAME =
  process.env.VECTOR_INDEX_NAME || "chunks_vector_index";


const searchSimilarChunks = async ({
  query,
  tenantId,
  limit = 5,
  documentId
}) => {

  // Step 1: Generate query embedding
  const queryVector = await generateQueryEmbedding(query);


  // Step 2: Convert tenantId into MongoDB ObjectId
  const tenantObjectId = new mongoose.Types.ObjectId(
    String(tenantId)
  );


  // Step 3: Create tenant filter
  const filters = [
    {
      tenantId: {
        $eq: tenantObjectId
      }
    },
    {
      embeddingStatus: {
        $eq: "COMPLETED"
      }
    }
  ];


  // Optional document filter
  if (documentId) {

    if (!mongoose.Types.ObjectId.isValid(documentId)) {
      throw new Error("Invalid document ID.");
    }

    filters.push({
      documentId: {
        $eq: new mongoose.Types.ObjectId(documentId)
      }
    });

  }


  // Step 4: Execute Vector Search
  const results = await DocumentChunk.aggregate([

    {
      $vectorSearch: {

        index: VECTOR_INDEX_NAME,

        path: "embedding",

        queryVector,

        numCandidates: Math.max(limit * 20, 100),

        limit,

        filter: {
          $and: filters
        }

      }
    },


    // Step 5: Return required fields
    {
      $project: {

        _id: 1,

        documentId: 1,

        chunkIndex: 1,

        content: 1,

        metadata: 1,

        score: {
          $meta: "vectorSearchScore"
        }

      }
    }

  ]);


  return results;

};


export {
  searchSimilarChunks
};