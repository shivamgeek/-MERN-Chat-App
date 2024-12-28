import { Server } from "socket.io";
import http from "http";
import express from "express";

const expressApp = express();
const server = http.createServer(expressApp);

const io = new Server(server, {
  cors: {
    // origin: ["http://localhost:5173"],
  },
});

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

const userSocketMap = {}; // {userId: socketId}

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;

  if (!userSocketMap[userId]) {
    userSocketMap[userId] = socket.id;
  }

  console.log("User connected: ", Object.keys(userSocketMap));

  // broadcast to all connected clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("A user disconnected ", userId);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, expressApp, server };
