import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { env } from "./configs/env";
import router from "./routes";
import globalError from "./middlewares/globalError.middleware";

const app = express();

// Middleware
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  }),
); // Enables Cross-Origin Resource Sharing
app.use(compression()); // Compresses response bodies for faster delivery
app.use(express.json()); // Parse incoming JSON requests
app.use(cookieParser()); // Parse incoming cookies request
app.use("/api/v1", router);

// Default route for testing
app.get("/", (req, res) => {
  res.send("API is running");
});

// Global Error handler
app.use(globalError);

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: "Route Not Found",
  });
});

export default app;
