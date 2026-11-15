import express from "express";

import protect from "../middleware/authMiddleware.js";
import requireTenant from "../middleware/tenantMiddleware.js";

import {
    processChunksController,
    getChunksController
} from "../controllers/chunkController.js";

import asyncHandler from "../utils/asyncHandler.js";

const router = express.Router();


// Generate chunks
router.post(
    "/:id/process",
    protect,
    requireTenant,
    asyncHandler(processChunksController)
);


// Get chunks
router.get(
    "/:id",
    protect,
    requireTenant,
    asyncHandler(getChunksController)
);


export default router;