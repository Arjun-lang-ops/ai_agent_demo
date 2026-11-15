import express from "express";

import {
  getToolsController,
  searchDocumentsController,
  listDocumentsController
} from "../controllers/mcpController.js";

import  protect  from "../middleware/authMiddleware.js";

import  requireTenant  from "../middleware/tenantMiddleware.js";

import asyncHandler from "../utils/asyncHandler.js";

const router = express.Router();

router.get(
  "/tools",
  protect,
  requireTenant,
  asyncHandler(getToolsController)
);

router.post(
  "/search",
  protect,
  requireTenant,
  asyncHandler(searchDocumentsController)
);

router.get(
  "/documents",
  protect,
  requireTenant,
  asyncHandler(listDocumentsController)
);

export default router;