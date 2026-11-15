import DocumentChunk from "../models/DocumentChunk.js";
import Document from "../models/Document.js";

import splitText from "../utils/textSplitter.js";

const createDocumentChunks = async (
    documentId,
    tenantId
) => {

    // 1. Find document belonging to this tenant
    const document = await Document.findOne({
        _id: documentId,
        tenantId
    });

    if (!document) {
        throw new Error("Document not found.");
    }

    // 2. Check extracted text
    if (!document.extractedText) {
        throw new Error("Document has no extracted text.");
    }

    // 3. Split extracted text
    const chunks = splitText(
        document.extractedText,
        1000,
        150
    );

    if (chunks.length === 0) {
        throw new Error("No chunks generated.");
    }

    // 4. Prepare MongoDB documents
    const chunkDocuments = chunks.map(
        (content, index) => ({

            tenantId: document.tenantId,

            documentId: document._id,

            chunkIndex: index,

            content,

            // Page numbers are not available from
            // our current Phase 4 extraction service.
            pageNumber: null,

            metadata: {
                originalName: document.originalName,
                mimeType: document.mimeType
            }

        })
    );

    // 5. Remove previous chunks if reprocessing
    await DocumentChunk.deleteMany({
        documentId: document._id,
        tenantId
    });

    // 6. Save new chunks
    await DocumentChunk.insertMany(chunkDocuments);

    // 7. Update document status
    document.status = "CHUNKED";

    await document.save();

    return {
        documentId: document._id,
        totalChunks: chunks.length
    };

};


// Get all chunks belonging to a document
const getDocumentChunks = async (
    documentId,
    tenantId
) => {

    return await DocumentChunk.find({
        documentId,
        tenantId
    }).sort({
        chunkIndex: 1
    });

};


export {
    createDocumentChunks,
    getDocumentChunks
};