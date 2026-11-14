import express from "express";
import cors from "cors";
import helmet from "helmet";
import authRoutes from "./routes/authRoutes.js";
import protectedRoutes from "./routes/protectedRoutes.js";
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