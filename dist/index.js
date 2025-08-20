"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const http_1 = __importDefault(require("http"));
const app_1 = __importDefault(require("./app"));
const mongoose_1 = __importDefault(require("mongoose"));
const PORT = process.env.PORT || 4000;
const dbUrl = process.env.DB_URL;
const server = http_1.default.createServer(app_1.default);
const start = async () => {
    try {
        if (!dbUrl) {
            throw new Error("DB_URL environment variable is not defined");
        }
        await mongoose_1.default.connect(dbUrl)
            .then(() => {
            console.log("Mongo DB connected succesfully");
        })
            .catch((err) => {
            console.error(err);
        });
        server.listen(PORT, () => {
            console.log(`Server is running on PORT : ${PORT}`);
        });
    }
    catch (err) {
        console.error(err);
    }
};
start();
