import express from "express";

import protect from "../middleware/authMiddleware.js";
import requireTenant from "../middleware/tenantMiddleware.js";

import {
    generateEmbeddingsController
} from "../controllers/embeddingController.js";

import asyncHandler from "../utils/asyncHandler.js";

const router = express.Router();


// Generate embeddings for a document
router.post(
    "/:id/generate",
    protect,
    requireTenant,
    asyncHandler(generateEmbeddingsController)
);


export default router;