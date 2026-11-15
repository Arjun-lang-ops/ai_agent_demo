import express from "express";

import {
  askRagController
} from "../controllers/ragController.js";

import 
  protect
 from "../middleware/authMiddleware.js";

import 
  requireTenant
 from "../middleware/tenantMiddleware.js";

import asyncHandler from "../utils/asyncHandler.js";


const router = express.Router();


router.post(

  "/ask",

  protect,

  requireTenant,

  asyncHandler(askRagController)

);


export default router;