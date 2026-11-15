import ai from "../config/ai.js";

import EvaluationRun from "../models/EvaluationRun.js";

import {hybridSearch} from "./hybridSearchService.js";

import { generateRagAnswer } from "./ragService.js";

import evaluationDataset from "../evaluations/evaluationDataset.js";

const MODEL =
  process.env.LLM_MODEL || "gemini-2.5-flash";


// ----------------------------------
// 1. Calculate Recall@K
// ----------------------------------

const calculateRecallAtK = (
  retrievedIds,
  expectedIds
) => {

  if (!expectedIds.length) return null;

  const relevantRetrieved = expectedIds.filter(
    id => retrievedIds.includes(id)
  );

  return relevantRetrieved.length / expectedIds.length;
};


// ----------------------------------
// 2. Calculate MRR
// ----------------------------------

const calculateMRR = (
  retrievedIds,
  expectedIds
) => {

  if (!expectedIds.length) return null;

  const rank = retrievedIds.findIndex(
    id => expectedIds.includes(id)
  );

  return rank === -1 ? 0 : 1 / (rank + 1);
};


// ----------------------------------
// 3. Evaluate Generated Answer
// ----------------------------------

const evaluateAnswer = async ({
  query,
  answer,
  expectedAnswer,
  retrievedChunks
}) => {

  const response = await ai.models.generateContent({

    model: MODEL,

    contents: `
      You are an AI evaluation system.

      Evaluate the generated answer.

      USER QUESTION:
      ${query}

      REFERENCE ANSWER:
      ${expectedAnswer || "No reference answer provided."}

      RETRIEVED SOURCE INFORMATION:
      ${JSON.stringify(
        retrievedChunks.map(chunk => chunk.content)
      )}

      GENERATED ANSWER:
      ${answer}

      Evaluate these two metrics:

      1. relevance:
      Does the answer properly address the user's question?

      2. faithful:
      Is the answer supported by the retrieved source information?

      Return JSON only:

      {
        "relevance": true,
        "faithful": true,
        "reason": "The answer is relevant and supported by the source."
      }

      Use false if the answer fails either check.
    `,

    config: {
      temperature: 0,
      responseMimeType: "application/json"
    }

  });

  try {

    return JSON.parse(response.text);

  } catch {

    return {
      relevance: false,
      faithful: false,
      reason: "Evaluation parsing failed."
    };

  }

};


// ----------------------------------
// 4. Run One Evaluation Test
// ----------------------------------

const runSingleEvaluation = async ({
  testCase,
  tenantId,
  k
}) => {

  // Retrieve documents using hybrid search

  const searchResult = await hybridSearch({
    query: testCase.query,
    tenantId,
    limit: k
  });

  // Support either array or object-based service results

  const retrievedChunks = Array.isArray(searchResult)
    ? searchResult
    : searchResult.results || searchResult.data || [];

  const retrievedIds = retrievedChunks.map(
    chunk => String(chunk.documentId)
  );

  // Calculate retrieval metrics

  const recallAtK = calculateRecallAtK(
    retrievedIds,
    testCase.expectedDocumentIds || []
  );

  const reciprocalRank = calculateMRR(
    retrievedIds,
    testCase.expectedDocumentIds || []
  );

  // Generate actual RAG answer

  const ragResult = await generateRagAnswer({
    query: testCase.query,
    tenantId,
    limit: k
  });

  // Evaluate answer quality

  const answerMetrics = await evaluateAnswer({

    query: testCase.query,

    answer: ragResult.answer,

    expectedAnswer: testCase.expectedAnswer,

    retrievedChunks

  });

  return {

    testId: testCase.id,

    query: testCase.query,

    retrievedDocumentIds: retrievedIds,

    answer: ragResult.answer,

    retrievalMetrics: {
      recallAtK,
      reciprocalRank
    },

    answerMetrics

  };

};


// ----------------------------------
// 5. Run Complete Evaluation Suite
// ----------------------------------

export const runEvaluationSuite = async ({
  tenantId,
  userId,
  k = 5
}) => {

  const evaluationRun = await EvaluationRun.create({

    tenantId,

    executedBy: userId,

    totalTests: evaluationDataset.length,

    status: "RUNNING"

  });

  try {

    const results = [];

    for (const testCase of evaluationDataset) {

      console.log(
        `Evaluating: ${testCase.query}`
      );

      const result = await runSingleEvaluation({

        testCase,

        tenantId,

        k

      });

      results.push(result);

    }

    // Calculate average metrics

    const average = (values) => {

      const validValues = values.filter(
        value => value !== null && Number.isFinite(value)
      );

      if (!validValues.length) return null;

      return validValues.reduce(
        (sum, value) => sum + value,
        0
      ) / validValues.length;

    };

    const metrics = {

      recallAtK: average(
        results.map(
          r => r.retrievalMetrics.recallAtK
        )
      ),

      mrr: average(
        results.map(
          r => r.retrievalMetrics.reciprocalRank
        )
      ),

      answerRelevance: average(
        results.map(
          r => r.answerMetrics.relevance ? 1 : 0
        )
      ),

      faithfulness: average(
        results.map(
          r => r.answerMetrics.faithful ? 1 : 0
        )
      )

    };

    // Save completed evaluation

    evaluationRun.results = results;

    evaluationRun.metrics = metrics;

    evaluationRun.status = "COMPLETED";

    await evaluationRun.save();

    return evaluationRun;

  } catch (error) {

    evaluationRun.status = "FAILED";

    await evaluationRun.save();

    throw error;

  }

};