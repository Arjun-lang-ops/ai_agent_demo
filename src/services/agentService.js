import graph from "../agents/ragAgentGraph.js";

export const runRagAgent = async ({
  query,
  tenantId,
  documentId
}) => {

  const result = await graph.invoke({

    query,

    searchQuery: query,

    tenantId,

    documentId: documentId || null,

    retrievedChunks: [],

    answer: "",

    sources: [],

    evaluation: null,

    retryCount: 0,

    maxRetries: 1

  });

  return {

    answer: result.answer,

    sources: result.sources,

    evaluation: result.evaluation,

    retryCount: result.retryCount,

    retrievedChunks: result.retrievedChunks.length

  };

};