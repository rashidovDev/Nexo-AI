import dotenv from "dotenv";
dotenv.config();
import http from "http";
import app from "./app";
import mongoose from "mongoose";
import { Server } from "socket.io";
import { initSocket } from "./socket/index";

const PORT = process.env.PORT || 6000;  
const dbUrl = process.env.DB_URL;

const server = http.createServer(app);

// ✅ Attach socket.io to existing server 
const io = new Server(server, {
  cors: {
    origin: ["https://nexo-ai.site", "http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// ✅ Initialize socket events
initSocket(io);

const start = async () => { 
 try {  
        if (!dbUrl) {
            throw new Error("DB_URL environment variable is not defined");
        }
        await mongoose.connect(dbUrl)
            .then(() => {
                console.log("Mongo DB connected succesfully")
            })
            .catch((err) => {
                console.error(err)
            });
        server.listen(PORT, () => {
            console.log(`Server is running on PORT : ${PORT}`)
        });
    } catch (err) {
        console.error(err)
    }
};

start()
