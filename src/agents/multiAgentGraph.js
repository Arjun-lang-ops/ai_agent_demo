import { Annotation, StateGraph, START, END } from "@langchain/langgraph";

import ai from "../config/ai.js";

import { callMcpTool } from "../services/mcpClientService.js";

import { parseMcpResult } from "../utils/parseMcpResult.js";

import { validateOutput } from "../guradrails/outputGaurdrails.js";

import { interrupt } from "@langchain/langgraph";

const MultiAgentState = Annotation.Root({

  query: Annotation(),

  tenantId: Annotation(),

  documentId: Annotation(),

  selectedAgent: Annotation(),

  retrievedData: Annotation(),

  answer: Annotation(),

  evaluation: Annotation(),

  agentHistory: Annotation({
    default: () => []
  }),
  outputBlocked: Annotation({
  default: () => false
}),

});

const supervisorNode = async (state) => {

  console.log("Supervisor: Understanding user query...");

  const response = await ai.models.generateContent({

    model: process.env.LLM_MODEL || "gemini-2.5-flash",

    contents: `
      You are a supervisor managing two specialized agents.

      1. retrieval_agent:
         Use this agent when the user asks questions
         about company policies, rules, benefits,
         information or facts in documents.

      2. document_agent:
         Use this agent when the user wants to list,
         identify or inspect uploaded documents.

      USER QUESTION:
      ${state.query}

      Return only JSON:

      {
        "agent": "retrieval_agent"
      }

      Or:

      {
        "agent": "document_agent"
      }
    `,

    config: {
      temperature: 0.2,
      responseMimeType: "application/json",
      maxOutputTokens: 1500
    }

  });

  let decision;

  try {

    decision = JSON.parse(response.text);

  } catch {

    decision = {
      agent: "retrieval_agent"
    };

  }

  const allowedAgents = [
    "retrieval_agent",
    "document_agent"
  ];

  const selectedAgent = allowedAgents.includes(decision.agent)
    ? decision.agent
    : "retrieval_agent";

  return {

    selectedAgent,

    agentHistory: [
      ...state.agentHistory,
      "supervisor"
    ]

  };

};

const retrievalAgent = async (state) => {

  console.log("Retrieval Agent: Searching documents...");

  const result = await callMcpTool(
    "search_documents",
    {
      query: state.query,
      tenantId: state.tenantId,
      documentId: state.documentId,
      limit: 5
    }
  );

  const retrievedData = parseMcpResult(result);

  return {

    retrievedData,

    agentHistory: [
      ...state.agentHistory,
      "retrieval_agent"
    ]

  };

};

const documentAgent = async (state) => {

  console.log("Document Agent: Listing documents...");

  const result = await callMcpTool(
    "list_documents",
    {
      tenantId: state.tenantId
    }
  );

  const retrievedData = parseMcpResult(result);

  return {

    retrievedData,

    agentHistory: [
      ...state.agentHistory,
      "document_agent"
    ]

  };

};

const responseAgent = async (state) => {

  console.log("Response Agent: Generating answer...");

  const context = JSON.stringify(state.retrievedData);

  const response = await ai.models.generateContent({

    model: process.env.LLM_MODEL || "gemini-2.5-flash",

    contents: `
      USER QUESTION:
      ${state.query}

      DOCUMENT INFORMATION:
      ${context}

      Answer using only the supplied information.
    `,

    config: {
      temperature: 0.2,
      maxOutputTokens: 1500
    }

  });

  const answer = response.text || "";

  const validation = validateOutput(answer);

  if (!validation.allowed) {

    return {

      answer: "I cannot provide this response because it failed security validation.",

      outputBlocked: true

    };

  }

  return {

    answer: validation.answer,

    outputBlocked: false,

    agentHistory: [
      ...state.agentHistory,
      "response_agent"
    ]

  };

};

const approvalNode = async (state) => {
  const approval = interrupt({
    action: "delete_documents",
    message: "Approval required before deleting documents.",
    details: state.pendingAction
  });

  if (!approval.approved) {
    return {
      approvalStatus: "REJECTED"
    };
  }

  return {
    approvalStatus: "APPROVED"
  };
};

const evaluationAgent = async (state) => {

  console.log("Evaluation Agent: Checking answer...");

  if (state.outputBlocked) {

    return {

      evaluation: {

        grounded: false,

        reason: "Output failed security validation."

      },

      agentHistory: [
        ...state.agentHistory,
        "evaluation_agent"
      ]

    };

  }

  const response = await ai.models.generateContent({

    model: process.env.LLM_MODEL || "gemini-2.5-flash",

    contents: `
      Evaluate the following answer.

      USER QUESTION:
      ${state.query}

      SOURCE INFORMATION:
      ${JSON.stringify(state.retrievedData)}

      GENERATED ANSWER:
      ${state.answer}

      Check whether the answer is supported by the source.

      Return JSON only:

      {
        "grounded": true,
        "reason": "Answer is supported by the source."
      }

      If unsupported, grounded must be false.
    `,

    config: {
      temperature: 0,
      responseMimeType: "application/json"
    }

  });

  let evaluation;

  try {

    evaluation = JSON.parse(response.text);

  } catch {

    evaluation = {
      grounded: false,
      reason: "Evaluation failed."
    };

  }

  return {

    evaluation,

    agentHistory: [
      ...state.agentHistory,
      "evaluation_agent"
    ]

  };

};


const routeAgent = (state) => {

  if (state.selectedAgent === "document_agent") {

    return "document_agent";

  }

  return "retrieval_agent";

};


const workflow = new StateGraph(MultiAgentState)

  .addNode("supervisor", supervisorNode)

  .addNode("retrieval_agent", retrievalAgent)

  .addNode("document_agent", documentAgent)

  .addNode("response_agent", responseAgent)

  .addNode("evaluation_agent", evaluationAgent)

  .addEdge(START, "supervisor")

  .addConditionalEdges(
    "supervisor",
    routeAgent,
    {
      retrieval_agent: "retrieval_agent",
      document_agent: "document_agent"
    }
  )

  .addEdge("retrieval_agent", "response_agent")

  .addEdge("document_agent", "response_agent")

  .addEdge("response_agent", "evaluation_agent")

  .addEdge("evaluation_agent", END)

  .compile();


export default workflow;