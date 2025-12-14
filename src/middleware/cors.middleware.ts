// module.exports = (req, res, next) => {
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header("Access-Control-Allow-Methods","GET, PUT, PATCH, POST, DELETE");
//     res.header("Access-Control-Allow-Headers", "Content-type");
//     next()
// }


const allowedOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:5500',
     "http://192.168.0.100:3000",
     "https://unennobling-housemaidy-sasha.ngrok-free.dev",
       "https://www.nexo-ai.site", "https://nexo-ai.site", "https://nexo-ai.vercel.app",
];

interface OriginCallback {
    (err: Error | null, allow?: boolean): void;
}

type OriginChecker = (origin: string | undefined, callback: OriginCallback) => void;

interface CorsOptions {
    origin: OriginChecker;
    methods: string;
    allowedHeaders: string;
    exposedHeaders?: string;
    credentials?: boolean;
    optionsSuccessStatus?: number;
}
 
const corsOptions: CorsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: 'GET,POST,PUT,DELETE,PATCH,OPTIONS', // ✅ Allow common HTTP methods
    allowedHeaders: 'Content-Type,Authorization', // ✅ Allow necessary headers
    exposedHeaders: 'x-total-count',
    credentials: true, // ✅ Allow cookies/auth headers
    optionsSuccessStatus: 200,
};

module.exports = corsOptions;