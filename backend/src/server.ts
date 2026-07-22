import express from "express";
import cors from "cors";
import { config } from "./config";
import { errorHandler } from "./middleware/errorHandler";
import healthRoutes from "./routes/health";
import authRoutes from "./routes/auth";
import productRoutes from "./routes/products";
import orderRoutes from "./routes/orders";
import prisma from "./prisma";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use("/api", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);

// Health check at root
app.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "Wise Accessories API Server",
    version: "0.1.0"
  });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found"
  });
});

// Error handling middleware
app.use(errorHandler);

// Graceful shutdown
const shutdown = async () => {
  console.log("Shutting down server...");
  await prisma.$disconnect();
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

// Start server
const port = config.port;
app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(`📝 Health check: http://localhost:${port}/api/health`);
  console.log(`Environment: ${config.nodeEnv}`);
});

export default app;
