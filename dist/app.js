"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const morgan_1 = __importDefault(require("morgan"));
const express_fileupload_1 = __importDefault(require("express-fileupload"));
// ROUTES
const user_route_1 = __importDefault(require("./routes/user.route"));
const message_route_1 = __importDefault(require("./routes/message.route"));
const chat_route_1 = __importDefault(require("./routes/chat.route"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, express_fileupload_1.default)({ useTempFiles: true }));
app.use('/api/user', user_route_1.default);
app.use('/api/message', message_route_1.default);
app.use('/api/chat', chat_route_1.default);
app.use((0, cors_1.default)({
    origin: "http://localhost:3000", // React app origin
    credentials: true, // allow cookies
}));
app.use((0, cookie_parser_1.default)());
app.use((0, morgan_1.default)("combined"));
// app.use("/api/auth", authRoutes);
exports.default = app;
