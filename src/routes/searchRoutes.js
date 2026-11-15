import express from "express";

import {
  vectorSearchController
} from "../controllers/searchController.js";

import protect from "../middleware/authMiddleware.js";

import 
  requireTenant
 from "../middleware/tenantMiddleware.js";

import asyncHandler from "../utils/asyncHandler.js";


const router = express.Router();


router.post(
  "/vector",
  protect,
  requireTenant,
  asyncHandler(vectorSearchController)
);


export default router;