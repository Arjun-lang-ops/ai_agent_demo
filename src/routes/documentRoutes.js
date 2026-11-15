import express from "express";

import protect from "../middleware/authMiddleware.js";
import requireTenant from "../middleware/tenantMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

import {
    uploadDocumentController,
    getDocumentsController,
    getDocumentByIdController,
    deleteDocumentController
} from "../controllers/documentController.js";

import asyncHandler from "../utils/asyncHandler.js";

const router = express.Router();


// Upload document
router.post(
    "/upload",
    protect,
    requireTenant,
    upload.single("document"),
    asyncHandler(uploadDocumentController)
);


// Get all documents
router.get(
    "/",
    protect,
    requireTenant,
    asyncHandler(getDocumentsController)
);


// Get single document
router.get(
    "/:id",
    protect,
    requireTenant,
    asyncHandler(getDocumentByIdController)
);


// Delete document
router.delete(
    "/:id",
    protect,
    requireTenant,
    asyncHandler(deleteDocumentController)
);


export default router;