import express from "express";

import {
  hybridSearchController
} from "../controllers/hybridSearchController.js";

import 
  protect
 from "../middleware/authMiddleware.js";

import 
  requireTenant
 from "../middleware/tenantMiddleware.js";

import asyncHandler from "../utils/asyncHandler.js";


const router = express.Router();


router.post(
  "/hybrid",
  protect,
  requireTenant,
  asyncHandler(hybridSearchController)
);


export default router;