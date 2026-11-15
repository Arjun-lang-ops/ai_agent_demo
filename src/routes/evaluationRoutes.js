import express from "express";

import 
  protect
 from "../middleware/authMiddleware.js";

import 
  requireTenant
 from "../middleware/tenantMiddleware.js";

import 
  authorizeRoles
 from "../middleware/roleMiddleware.js";

import 
  {runEvaluationController}
 from "../controllers/evaluationController.js";

import asyncHandler from "../utils/asyncHandler.js";

const router = express.Router();

router.post(
  "/run",
  protect,
  requireTenant,
  authorizeRoles("ADMIN"),
  asyncHandler(runEvaluationController)
);

export default router;