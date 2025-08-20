import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import fileUpload from "express-fileupload"

// ROUTES
import userRoute from './routes/user.route'
import messageRoute from './routes/message.route'
import chatRoute from './routes/chat.route'

const app = express(); 

app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload({ useTempFiles: true }));

app.use('/api/user', userRoute)
app.use('/api/message', messageRoute)
app.use('/api/chat', chatRoute)
 
app.use(
  cors({
    origin: "http://localhost:3000", // React app origin
    credentials: true, // allow cookies
  })
);

app.use(cookieParser());

app.use(morgan("combined"));

// app.use("/api/auth", authRoutes);

export default app;