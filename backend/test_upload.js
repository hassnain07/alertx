// test_upload.js
const fs = require("fs");
const http = require("http");

const filePath = "uploads/gateDev/1765564110211-981718446.jpg"; // replace with a local image path
const imageBuffer = fs.readFileSync(filePath);

const options = {
  hostname: "localhost",
  port: 3000,
  path: "/upload",
  method: "POST",
  headers: {
    "Content-Type": "image/jpeg",
    "Content-Length": imageBuffer.length,
  },
};

const req = http.request(options, (res) => {
  let data = "";
  res.on("data", (chunk) => (data += chunk));
  res.on("end", () => {
    console.log("Response from server:", data);
  });
});

req.on("error", (err) => {
  console.error("Error:", err);
});

// Send image buffer as raw POST body
req.write(imageBuffer);
req.end();
