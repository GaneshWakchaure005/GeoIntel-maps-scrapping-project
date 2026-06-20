import express from "express";
import cors from "cors";
import morgan from "morgan";

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Test Route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Geo Intelligence Platform API is running"
  });
});

export default app;