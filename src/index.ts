import dotenv from "dotenv";
dotenv.config();
import http from "http";
import app from "./app";
import mongoose from "mongoose";

const PORT = process.env.PORT || 4000;  
const dbUrl = process.env.DB_URL;

const server = http.createServer(app);

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