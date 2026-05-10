const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  process.env.CLIENT_URL
].filter(Boolean);

const isAllowedOrigin = (origin) => (
  !origin
  || allowedOrigins.includes(origin)
  || /\.ngrok-free\.app$/.test(new URL(origin).hostname)
);

const corsOptions = {
  origin(origin, callback) {
    try {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
        return;
      }
    } catch (error) {
      callback(error);
      return;
    }

    callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "ngrok-skip-browser-warning"]
};

module.exports = {
  corsOptions
};
