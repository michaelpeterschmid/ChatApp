// server.js
import http from "http";
import express from "express";
import { Server } from "socket.io";
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
const io = new Server(httpServer);


//runs every time a client connects to our server, and gives each one an id (it's room)
io.on("connection", (socket) => {

  console.log("A player connected:", socket.id);


  //listening for events from client!
  socket.on("send-message", (message, room) => {

    //and calling events in all clients (indlucing the one that sent the message)
    /* io.emit("receive-message", message); */

    //broadcasting if no room mentioned, otherwise emiting to specific room
    if(room===""){
        //just calling events in all clients but not the one that send it:
        socket.broadcast.emit("receive-message", message);
    } else {
        socket.to(room).emit("receive-message", message);
    }

    console.log(message);
  })

  socket.on("join-room", (room, callback) => {
    socket.join(room);
    callback(`you joined the room: ${room}`);
  })

});

// use default port provided by render.com or start HTTP server with port 3000
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server läuft auf http://localhost:${PORT}`);
});

