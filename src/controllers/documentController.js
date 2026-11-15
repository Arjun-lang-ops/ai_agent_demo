import {
    uploadDocument,
    getDocuments,
    getDocumentById,
    deleteDocument
} from "../services/documentService.js";


// Upload document
const uploadDocumentController = async (req, res) => {

    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: "Please select a document to upload."
        });
    }

    const document = await uploadDocument(
        req.file,
        req.user,
        req.tenantId
    );

    res.status(201).json({

        success: true,

        message: "Document uploaded and text extracted successfully.",

        document: {
            id: document._id,
            originalName: document.originalName,
            mimeType: document.mimeType,
            fileSize: document.fileSize,
            status: document.status
        }

    });

};


// Get all documents
const getDocumentsController = async (req, res) => {

    const documents = await getDocuments(req.tenantId);

    res.status(200).json({

        success: true,

        count: documents.length,

        documents

    });

};


// Get single document
const getDocumentByIdController = async (req, res) => {

    const document = await getDocumentById(
        req.params.id,
        req.tenantId
    );

    if (!document) {
        return res.status(404).json({
            success: false,
            message: "Document not found."
        });
    }

    res.status(200).json({

        success: true,

        document

    });

};


// Delete document
const deleteDocumentController = async (req, res) => {

    const document = await deleteDocument(
        req.params.id,
        req.tenantId
    );

    if (!document) {
        return res.status(404).json({
            success: false,
            message: "Document not found."
        });
    }

    res.status(200).json({

        success: true,

        message: "Document deleted successfully."

    });

};


export {
    uploadDocumentController,
    getDocumentsController,
    getDocumentByIdController,
    deleteDocumentController
};