const express = require("express");
const cors = require("cors");
const http = require("http");
require("dotenv").config();

const { connectDB } = require("./src/config");
const { corsOptions } = require("./src/config/cors");
const { setupSocket } = require("./src/socket");
const routes = require("./src/routes");
const { sendSuccess } = require("./src/utils");

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

connectDB();
setupSocket(server, corsOptions);

app.use(cors(corsOptions));
app.use(express.json());

app.use("/api", routes);

app.get("/", (req, res) => {
  sendSuccess(res, 200, "Chat API is running");
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("[Global Error Handler]", err.message, err.stack);
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(statusCode).json({ error: message });
});

server.listen(PORT, () => {
  console.log(`[Server] Running on port ${PORT}`);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("[Unhandled Rejection]", reason);
});

process.on("uncaughtException", (error) => {
  console.error("[Uncaught Exception]", error.message, error.stack);
});
