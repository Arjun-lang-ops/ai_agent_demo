import ai from "../config/ai.js";

import DocumentChunk from "../models/DocumentChunk.js";
import Document from "../models/Document.js";

const EMBEDDING_MODEL =
    process.env.EMBEDDING_MODEL || "gemini-embedding-2";

const EMBEDDING_DIMENSIONS = Number(
    process.env.EMBEDDING_DIMENSIONS || 768
);


// Generate embedding for one chunk
const generateEmbedding = async (text, title) => {

    const formattedText =
        `title: ${title || "none"} | text: ${text}`;

    const response = await ai.models.embedContent({

        model: EMBEDDING_MODEL,

        contents: formattedText,

        config: {
            outputDimensionality: EMBEDDING_DIMENSIONS
        }

    });

    const embedding = response.embeddings?.[0]?.values;

    if (!embedding || embedding.length !== EMBEDDING_DIMENSIONS) {
        throw new Error("Invalid embedding returned by Gemini.");
    }

    return embedding;

};


// Generate embeddings for all chunks of a document
const generateDocumentEmbeddings = async (
    documentId,
    tenantId
) => {

    // 1. Verify document belongs to this tenant
    const document = await Document.findOne({
        _id: documentId,
        tenantId
    });

    if (!document) {
        throw new Error("Document not found.");
    }

    // 2. Retrieve document chunks
    const chunks = await DocumentChunk.find({
        documentId,
        tenantId
    }).sort({
        chunkIndex: 1
    });

    if (chunks.length === 0) {
        throw new Error("No chunks found. Process the document first.");
    }

    let generatedCount = 0;
    let failedCount = 0;

    // 3. Process chunks in small concurrent groups
    const batchSize = 3;

    for (let i = 0; i < chunks.length; i += batchSize) {

        const batch = chunks.slice(i, i + batchSize);

        const results = await Promise.allSettled(

            batch.map(async (chunk) => {

                try {

                    // Skip chunks already embedded using this model
                    if (
                        chunk.embeddingStatus === "COMPLETED" &&
                        chunk.embeddingModel === EMBEDDING_MODEL &&
                        chunk.embedding?.length === EMBEDDING_DIMENSIONS
                    ) {
                        return "SKIPPED";
                    }

                    // Mark as processing
                    await DocumentChunk.updateOne(
                        {
                            _id: chunk._id,
                            tenantId
                        },
                        {
                            $set: {
                                embeddingStatus: "PENDING"
                            }
                        }
                    );

                    // Generate embedding
                    const embedding = await generateEmbedding(
                        chunk.content,
                        document.originalName
                    );

                    // Save embedding
                    await DocumentChunk.updateOne(
                        {
                            _id: chunk._id,
                            tenantId
                        },
                        {
                            $set: {
                                embedding,
                                embeddingModel: EMBEDDING_MODEL,
                                embeddingStatus: "COMPLETED"
                            }
                        }
                    );

                    return "COMPLETED";

                } catch (error) {

                    await DocumentChunk.updateOne(
                        {
                            _id: chunk._id,
                            tenantId
                        },
                        {
                            $set: {
                                embeddingStatus: "FAILED"
                            }
                        }
                    );

                    throw error;

                }

            })

        );

        // 4. Count successful and failed embeddings
        for (const result of results) {

            if (result.status === "fulfilled") {

                if (result.value === "COMPLETED") {
                    generatedCount++;
                }

            } else {

                failedCount++;

                console.error(
                    "Embedding generation failed:",
                    result.reason.message
                );

            }

        }

    }

    // 5. Check whether all chunks now have embeddings
    const remainingChunks = await DocumentChunk.countDocuments({

        documentId,

        tenantId,

        $or: [
            { embeddingStatus: { $ne: "COMPLETED" } },
            { embedding: { $exists: false } }
        ]

    });

    // Update document status only when all chunks are embedded
    if (remainingChunks === 0) {

        document.status = "EMBEDDED";

        await document.save();

    }

    return {

        documentId,

        totalChunks: chunks.length,

        generatedCount,

        failedCount,

        remainingChunks,

        status: remainingChunks === 0
            ? "EMBEDDED"
            : "EMBEDDING_INCOMPLETE"

    };

};


const generateQueryEmbedding = async (query) => {

    const formattedQuery =
        `task: search result | query: ${query}`;

    const response = await ai.models.embedContent({

        model: EMBEDDING_MODEL,

        contents: formattedQuery,

        config: {
            outputDimensionality: EMBEDDING_DIMENSIONS
        }

    });

    const embedding = response.embeddings?.[0]?.values;

    if (!embedding || embedding.length !== EMBEDDING_DIMENSIONS) {
        throw new Error("Invalid query embedding returned by Gemini.");
    }

    return embedding;

};


export {
    generateEmbedding,
    generateDocumentEmbeddings,generateQueryEmbedding 
};