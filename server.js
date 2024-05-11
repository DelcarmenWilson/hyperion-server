const express = require("express");
const http = require("http");

const app = express();

const server = http.createServer(app);

import { Server } from "socket.io";

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("connected");
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

server.listen(3001, () => {
  console.log("Server listening on Port 3001");
});
