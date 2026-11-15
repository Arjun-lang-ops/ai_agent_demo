import express from "express";

import {
  runMultiAgentController
} from "../controllers/multiAgentController.js";

import  protect  from "../middleware/authMiddleware.js";

import  requireTenant  from "../middleware/tenantMiddleware.js";

import { inputGuardrail } from "../middleware/inputGuardrail.js";

import asyncHandler from "../utils/asyncHandler.js";

import { agentRateLimit } from "../middleware/agentRateLimit.js";

const router = express.Router();

router.post(
  "/run",
  protect,
  requireTenant,
  inputGuardrail,
  agentRateLimit,
  asyncHandler(runMultiAgentController)
);

export default router;