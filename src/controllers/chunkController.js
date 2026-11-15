import {
    createDocumentChunks,
    getDocumentChunks
} from "../services/chunkService.js";


// Process document into chunks
const processChunksController = async (req, res) => {

    const result = await createDocumentChunks(
        req.params.id,
        req.tenantId
    );

    res.status(200).json({

        success: true,

        message: "Document chunking completed.",

        result

    });

};


// Get document chunks
const getChunksController = async (req, res) => {

    const chunks = await getDocumentChunks(
        req.params.id,
        req.tenantId
    );

    res.status(200).json({

        success: true,

        count: chunks.length,

        chunks

    });

};


export {
    processChunksController,
    getChunksController
};