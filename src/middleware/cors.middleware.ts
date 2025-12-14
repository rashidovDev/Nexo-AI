import { CorsOptions } from "cors";

const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:5500",
  "http://192.168.0.100:3000",
  "https://unennobling-housemaidy-sasha.ngrok-free.dev",
  "https://www.nexo-ai.site",
   "https://nexo-ai.store", "https://nexo-ai.vercel.app",
];

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // allow server-to-server, Postman, curl (no origin)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked: ${origin}`));
    }
  },

  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["x-total-count"],
  credentials: true,
  optionsSuccessStatus: 200,
};

export default corsOptions;
