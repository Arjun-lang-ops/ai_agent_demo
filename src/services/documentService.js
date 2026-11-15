import fs from "fs/promises";
import path from "path";

import { createRequire } from "module";

const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");

import mammoth from "mammoth";

import Document from "../models/Document.js";

// Extract text from uploaded files
const extractText = async (file) => {

    const extension = path.extname(file.originalname).toLowerCase();

    let extractedText = "";

    // PDF extraction
    if (extension === ".pdf") {

        const buffer = await fs.readFile(file.path);

        const result = await pdf(buffer);

        extractedText = result.text;

    }

    // DOCX extraction
    else if (extension === ".docx") {

        const result = await mammoth.extractRawText({
            path: file.path
        });

        extractedText = result.value;

    }

    // TXT extraction
    else if (extension === ".txt") {

        extractedText = await fs.readFile(
            file.path,
            "utf-8"
        );

    }

    else {

        throw new Error("Unsupported document format.");

    }

    if (!extractedText.trim()) {
        throw new Error("No readable text found in the document.");
    }

    return extractedText;

};


// Upload and save document
const uploadDocument = async (file, user, tenantId) => {

    try {

        // 1. Extract text
        const extractedText = await extractText(file);

        // 2. Save document metadata
        const document = await Document.create({

            tenantId,

            uploadedBy: user._id,

            originalName: file.originalname,

            storedName: file.filename,

            filePath: file.path,

            mimeType: file.mimetype,

            fileSize: file.size,

            extractedText,

            status: "EXTRACTED"

        });

        return document;

    } catch (error) {

        // Delete uploaded file if extraction or DB save fails
        await fs.unlink(file.path).catch(() => {});

        throw error;

    }

};


// Get documents belonging to a tenant
const getDocuments = async (tenantId) => {

    return await Document.find({
        tenantId
    })
        .select("-extractedText -filePath")
        .sort({ createdAt: -1 });

};


// Get a single tenant-owned document
const getDocumentById = async (documentId, tenantId) => {

    return await Document.findOne({
        _id: documentId,
        tenantId
    }).select("-filePath");

};


// Delete a tenant-owned document
const deleteDocument = async (documentId, tenantId) => {

    const document = await Document.findOneAndDelete({
        _id: documentId,
        tenantId
    });

    if (!document) {
        return null;
    }

    await fs.unlink(document.filePath).catch(() => {});

    return document;

};


export {
    uploadDocument,
    getDocuments,
    getDocumentById,
    deleteDocument
};