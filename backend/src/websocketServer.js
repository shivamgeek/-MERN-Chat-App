import { WebSocketServer } from "ws";

// Create a WebSocket server
const server = new WebSocketServer({ port: 8080 });

server.on("connection", (socket) => {
  console.log("A client connected.");

  // Handle messages from the client
  socket.on("message", (message) => {
    console.log("Received:", message);
    // Echo the message back to the client
    socket.send(`Server received: ${message}`);
  });

  // Handle disconnection
  socket.on("close", () => {
    console.log("Client disconnected.");
  });

  // Handle errors
  socket.on("error", (error) => {
    console.error("WebSocket error:", error);
  });

  // Send a welcome message
  socket.send("Welcome to the WebSocket server!");
});

console.log("WebSocket server is running on ws://localhost:8080");
