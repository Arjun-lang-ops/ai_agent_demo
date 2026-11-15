import {
    generateDocumentEmbeddings
} from "../services/embeddingService.js";


const generateEmbeddingsController = async (req, res) => {

    const result = await generateDocumentEmbeddings(
        req.params.id,
        req.tenantId
    );

    res.status(200).json({

        success: true,

        message: "Embedding generation process completed.",

        result

    });

};


export {
    generateEmbeddingsController
};