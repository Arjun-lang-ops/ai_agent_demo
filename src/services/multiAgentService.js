import workflow from "../agents/multiAgentGraph.js";

export const runMultiAgentSystem = async ({
  query,
  tenantId,
  documentId
}) => {

  const result = await workflow.invoke(

  {
    query,
    tenantId,
    documentId: documentId || null,

    selectedAgent: "",

    retrievedData: [],

    answer: "",

    evaluation: null,

    agentHistory: [],

    outputBlocked: false

  },

  {
    recursionLimit: 10
  }

);

  return {

    answer: result.answer,

    selectedAgent: result.selectedAgent,

    evaluation: result.evaluation,

    agentHistory: result.agentHistory,

    sources: result.retrievedData

  };

};