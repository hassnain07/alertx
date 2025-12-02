const express = require("express");
const http = require("http");
const bodyParser = require("body-parser");
const cors = require("cors");

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

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve public files
app.use(express.static("public"));

// ⬅️ MOUNT YOUR ROUTES HERE
const authRoutes = require("./routes/apiRoutes");
app.use(authRoutes);

// Start server
server.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
