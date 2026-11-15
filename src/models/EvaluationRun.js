import mongoose from "mongoose";

const evaluationRunSchema = new mongoose.Schema({

  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tenant",
    required: true,
    index: true
  },

  executedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  totalTests: {
    type: Number,
    default: 0
  },

  metrics: {

    recallAtK: Number,

    mrr: Number,

    answerRelevance: Number,

    faithfulness: Number

  },

  results: [
    {
      testId: String,

      query: String,

      retrievedDocumentIds: [String],

      answer: String,

      retrievalMetrics: {
        recallAtK: Number,
        reciprocalRank: Number
      },

      answerMetrics: {
        relevance: Boolean,
        faithful: Boolean,
        reason: String
      }
    }
  ],

  status: {
    type: String,
    enum: ["RUNNING", "COMPLETED", "FAILED"],
    default: "RUNNING"
  }

}, {
  timestamps: true
});

export default mongoose.model(
  "EvaluationRun",
  evaluationRunSchema
);