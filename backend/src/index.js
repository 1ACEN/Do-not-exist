import express from "express";
import cors from "cors";
import cookieParser from 'cookie-parser'
import dotenv from "dotenv";
import { mongodb } from "./Db.js";
import authRoutes from "./routes/auth.js";

dotenv.config();

console.log(new Date().toISOString());

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());

mongodb().then(() => {
  app.use("/api/auth", authRoutes);
  app.listen(8000, () => {
    console.log("server started at localhost:8000");
  });
});

export default app;
