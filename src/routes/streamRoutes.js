import express from "express";

import {
  streamRagController
} from "../controllers/streamController.js";

import 
  protect
 from "../middleware/authMiddleware.js";

import 
  requireTenant
 from "../middleware/tenantMiddleware.js";


const router = express.Router();


router.post(

  "/",

  protect,

  requireTenant,

  streamRagController

);


export default router;