import mongoose from "mongoose";

const documentChunkSchema = new mongoose.Schema(
    {
        tenantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Tenant",
            required: true,
            index: true
        },

        documentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Document",
            required: true,
            index: true
        },

        chunkIndex: {
            type: Number,
            required: true
        },

        content: {
            type: String,
            required: true
        },

        pageNumber: {
            type: Number,
            default: null
        },

        metadata: {
            originalName: String,
            mimeType: String
        },

        // Gemini embedding vector
        embedding: {
            type: [Number],
            default: undefined
        },

        embeddingModel: {
            type: String,
            default: null
        },

        embeddingStatus: {
            type: String,
            enum: ["PENDING", "COMPLETED", "FAILED"],
            default: "PENDING"
        }
    },
    {
        timestamps: true
    }
);

// Prevent duplicate chunk indexes for a document
documentChunkSchema.index(
    {
        tenantId: 1,
        documentId: 1,
        chunkIndex: 1
    },
    {
        unique: true
    }
);

const DocumentChunk = mongoose.model(
    "DocumentChunk",
    documentChunkSchema
);

export default DocumentChunk;