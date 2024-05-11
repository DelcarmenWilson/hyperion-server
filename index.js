const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "http://localhost:3000", methods: ["GET", "POST"] },
});

io.on("connection", (socket) => {
  console.log(`client Connected:${socket.id}`);
  socket.on("new-call", (call) => {
    console.log("call has been emmited");
    socket.emit("new-call", call);
  });
  //CONFERENCES
  socket.on("coach-request", (agent, lead, conference) => {
    io.emit("coach-request-received", agent, lead, conference);
  });
  socket.on("coach-joined", (conferenceId) => {
    io.emit("coach-joined-recieved", conferenceId);
  });
  socket.on("test", () => {
    console.log("test emmited");
    io.emit("test-recieved");
  });
});

server.listen(4000, () => {
  console.log("listening on *:4000");
});
