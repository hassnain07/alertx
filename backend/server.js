const express = require("express");
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const app = express();
const PORT = 3000;

const pythonScript = path.join(
  __dirname,
  "..",
  "AI models",
  "image_to_embedding.py"
);

// Accept raw binary data up to 10 MB
app.use(express.raw({ type: "application/octet-stream", limit: "20mb" }));
app.get("/test", (req, res) => {
  res.status(200).send("test");
});

app.post(
  "/upload",
  express.raw({ type: "image/jpeg", limit: "5mb" }),
  (req, res) => {
    try {
      console.log("Image received:", req.body.length, "bytes");

      // Convert image buffer → base64
      const base64Image = req.body.toString("base64");

      // Spawn Python process
      const python = spawn(
        "D:/real-time-alert/AI models/venv/Scripts/python.exe", // <-- venv python
        ["D:/real-time-alert/AI models/image_to_embedding.py"] // <-- full path to script
      ); // Send JSON to Python via stdin
      python.stdin.write(JSON.stringify({ image: base64Image }));
      python.stdin.end();

      let output = "";
      let error = "";

      // Receive embedding from Python
      python.stdout.on("data", (data) => {
        output += data.toString();
      });

      python.stderr.on("data", (data) => {
        error += data.toString();
      });

      python.on("close", (code) => {
        if (code !== 0 || error) {
          console.error("Python error:", error);
          return res.status(500).json({ success: false, error });
        }

        const result = JSON.parse(output);

        console.log("Embedding length:", result.embedding?.length);

        return res.json(result);
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false });
    }
  }
);

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
