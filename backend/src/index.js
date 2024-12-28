import express from "express";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import dotenv from "dotenv";
import { connectToDb } from "./lib/db.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import { expressApp, server } from "./socket.js";
import path from "path";

dotenv.config();

expressApp.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);
expressApp.use(express.json({ limit: "50mb" }));
expressApp.use(cookieParser());

expressApp.use("/api/auth", authRoutes);
expressApp.use("/api/messages", messageRoutes);

const port = process.env.SERVER_PORT || 5001;
const _dirname = path.resolve();

if (process.env.NODE_ENV !== "production") {
  expressApp.use(express.static(path.join(_dirname, "../frontend/dist")));
  expressApp.get("*", (req, res) => {
    res.sendFile(path.join(_dirname, "../frontend/dist/index.html"));
  });
}

server.listen(port, () => {
  console.log("server listening on port ", port);
  connectToDb();
});
