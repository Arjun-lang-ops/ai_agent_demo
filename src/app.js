import express from "express";
import cors from "cors";
import helmet from "helmet";
import authRoutes from "./routes/authRoutes.js";
import protectedRoutes from "./routes/protectedRoutes.js";
import documentRoutes from "./routes/documentRoutes.js";
import chunkRoutes from "./routes/chunkRoutes.js";
import embeddingRoutes from "./routes/embeddingRoutes.js";
import searchRoutes from "./routes/searchRoutes.js";
import hybridSearchRoutes from "./routes/hybridSearchRoutes.js";
import ragRoutes from "./routes/ragRoutes.js";
import streamRoutes from "./routes/streamRoutes.js";
import agentRoutes from "./routes/agentRoutes.js";
import mcpRoutes from "./routes/mcpRoutes.js";
import multiAgentRoutes from "./routes/multiAgentRoutes.js";
import evaluationRoutes from "./routes/evaluationRoutes.js";
//import rateLimit from "express-rate-limit";

const app = express();

// Security headers
app.use(helmet());

// CORS
app.use(cors());

// Parse JSON
app.use(express.json({ limit: "2mb" }));

app.use("/api/auth", authRoutes);
app.use("/api", protectedRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/chunks", chunkRoutes);
app.use("/api/embeddings", embeddingRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/search", hybridSearchRoutes);
app.use("/api/rag", ragRoutes);
app.use("/api/rag/stream", streamRoutes);
app.use("/api/agent", agentRoutes);
app.use("/api/mcp", mcpRoutes);
app.use("/api/multi-agent", multiAgentRoutes);
app.use("/api/evaluations", evaluationRoutes);

// Rate limiting
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   limit: 100,
//   message: {
//     success: false,
//     message: "Too many requests. Please try again later."
//   }
// });

//app.use("/api", limiter);

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Enterprise AI Platform is running"
  });
});

export default app;