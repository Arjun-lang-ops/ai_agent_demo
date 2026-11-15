import mongoose from "mongoose";

import DocumentChunk from "../models/DocumentChunk.js";

import {
  generateQueryEmbedding
} from "./embeddingService.js";


const VECTOR_INDEX_NAME =
  process.env.VECTOR_INDEX_NAME || "chunks_vector_index";

const SEARCH_INDEX_NAME =
  process.env.SEARCH_INDEX_NAME || "chunks_text_index";


const hybridSearch = async ({
  query,
  tenantId,
  limit = 5,
  documentId
}) => {

  // 1. Generate query embedding
  const queryVector = await generateQueryEmbedding(query);


  // 2. Convert tenant ID to ObjectId
  const tenantObjectId = new mongoose.Types.ObjectId(
    String(tenantId)
  );


  // 3. Create common filters
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


  // 4. Add optional document filter
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


  // 5. Build Vector Search filter
  const vectorFilter = {
    $and: filters
  };


  // 6. Build Keyword Search filter
  const searchFilters = [
    {
      equals: {
        path: "tenantId",
        value: tenantObjectId
      }
    },
    {
      equals: {
        path: "embeddingStatus",
        value: "COMPLETED"
      }
    }
  ];


  if (documentId) {

    searchFilters.push({
      equals: {
        path: "documentId",
        value: new mongoose.Types.ObjectId(documentId)
      }
    });

  }


  // 7. Execute Hybrid Search
  const results = await DocumentChunk.aggregate([

    {
      $rankFusion: {

        input: {

          pipelines: {

            // Semantic Search
            vectorPipeline: [

              {
                $vectorSearch: {

                  index: VECTOR_INDEX_NAME,

                  path: "embedding",

                  queryVector,

                  numCandidates: 200,

                  limit: 20,

                  filter: vectorFilter

                }
              }

            ],


            // Keyword Search
            textPipeline: [

              {
                $search: {

                  index: SEARCH_INDEX_NAME,

                  compound: {

                    must: [

                      {
                        text: {

                          query,

                          path: "content"

                        }
                      }

                    ],

                    filter: searchFilters

                  }

                }
              },

              {
                $limit: 20
              }

            ]

          }

        },


        // Search weights
        combination: {

          weights: {

            vectorPipeline: 0.6,

            textPipeline: 0.4

          }

        },

        scoreDetails: true

      }

    },


    // 8. Return required fields
    {
      $project: {

        _id: 1,

        documentId: 1,

        chunkIndex: 1,

        content: 1,

        metadata: 1,

        score: {
          $meta: "score"
        },

        scoreDetails: {
          $meta: "scoreDetails"
        }

      }
    },


    // 9. Return final top results
    {
      $limit: limit
    }

  ]);


  return results;

};


export {
  hybridSearch
};