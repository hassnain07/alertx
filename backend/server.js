const express = require("express");
const http = require("http");
const bodyParser = require("body-parser");
const cors = require("cors");
const { Server } = require("socket.io");
const axios = require("axios"); // to send command to NodeMCU door lock

const app = express();
const server = http.createServer(app);

// CORS
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: "Content-Type, Authorization",
  })
);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("Dashboard connected");
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve public files
app.use(express.static("public"));

// ⬅️ MOUNT YOUR ROUTES HERE
const authRoutes = require("./routes/apiRoutes");
app.use(authRoutes);

global.io = io; // ⬅ so we can use io inside controllers

// Start server
server.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
