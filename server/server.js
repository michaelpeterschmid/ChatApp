// server.js
import http from "http";
import express from "express";
import { Server as SocketIOServer } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Serve ../client  (your HTML, CSS, JS)
app.use(express.static(path.join(__dirname, "../client")));

// Create HTTP server
const httpServer = http.createServer(app);

// Create WebSocket server on top of HTTP
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: "*",          // allow all origins (you can tighten this later)
    methods: ["GET", "POST"],
  },
});

// runs every time a client connects to our server, and gives each one a unique socket.id
io.on("connection", (socket) => {
  console.log("A player connected:", socket.id);

  // send current global online user count to all clients
  io.emit("update-number-of-global-online-users", io.engine.clientsCount);

  // listen for messages from client
  socket.on("send-message", (message, room) => {
    // if no room is specified, broadcast to everyone except sender
    if (room === "") {
      socket.broadcast.emit("receive-message", message);
    } else {
      // send only to other users in the given room
      socket.to(room).emit("receive-message", message);
    }

    console.log(message);
  });

  socket.on("join-room", (room, callback) => {
    const roomCount = io.sockets.adapter.rooms.get(room)?.size || 0;

    // don't allow more than 5 users per room
    if (roomCount >= 5) {
      callback(`failed to join the room: ${room}\nReason: room is already full`);
      return;
    }

    // if the socket was already in a room, leave it (enforce "one room per socket")
    if (socket.data.room && socket.data.room !== room) {
      const oldRoom = socket.data.room;
      socket.leave(oldRoom);

      const oldSize = io.sockets.adapter.rooms.get(oldRoom)?.size || 0;
      io.to(oldRoom).emit("update-number-of-room-online-users", oldSize);
    }

    // join the new room
    socket.join(room);
    socket.data.room = room;

    const newSize = io.sockets.adapter.rooms.get(room)?.size || 0;
    io.to(room).emit("update-number-of-room-online-users", newSize);

    callback(`you joined the room: ${room}`);
  });

  socket.on("disconnect", () => {
    // update global online users again when someone disconnects
    io.emit("update-number-of-global-online-users", io.engine.clientsCount);

    // if socket was in a room, update that room size
    const room = socket.data?.room;
    if (!room) return; // did not join any room

    const sizeAfterDisconnect = io.sockets.adapter.rooms.get(room)?.size || 0;
    io.to(room).emit("update-number-of-room-online-users", sizeAfterDisconnect);
  });
});

// use default port provided by render.com or start HTTP server with port 3000
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server läuft auf http://localhost:${PORT}`);
});
