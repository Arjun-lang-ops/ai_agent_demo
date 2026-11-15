import express from "express";

import { runAgentController } from "../controllers/agentController.js";

import  protect  from "../middleware/authMiddleware.js";

import  requireTenant  from "../middleware/tenantMiddleware.js";

import asyncHandler from "../utils/asyncHandler.js";

const router = express.Router();

router.post(
  "/run",
  protect,
  requireTenant,
  asyncHandler(runAgentController)
);

export default router;