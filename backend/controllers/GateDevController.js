const db = require("../config/db");
const { faceapi, canvas } = require("../faceModels");

// Euclidean distance for comparing vectors
function euclideanDistance(a, b) {
  return Math.sqrt(a.reduce((sum, val, i) => sum + (val - b[i]) ** 2, 0));
}

exports.uploadAndCompare = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No image uploaded" });

    const img = await canvas.loadImage(req.file.buffer);

    // Detect Face + Create Embedding
    const detection = await faceapi
      .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection)
      return res.status(400).json({ error: "No face detected in image" });

    const embedding = Array.from(detection.descriptor);

    // Get all embeddings from DB
    db.query("SELECT id, name, embedding FROM users", (err, rows) => {
      if (err) return res.status(500).json({ error: err });

      let bestMatch = null;
      let lowestDistance = 999;

      rows.forEach((row) => {
        const dbVector = JSON.parse(row.embedding);

        const dist = euclideanDistance(embedding, dbVector);

        if (dist < lowestDistance) {
          lowestDistance = dist;
          bestMatch = row;
        }
      });

      // Threshold for match
      if (lowestDistance < 0.45) {
        return res.json({
          success: true,
          matched: true,
          user: bestMatch,
          distance: lowestDistance,
        });
      }

      return res.json({
        success: true,
        matched: false,
        message: "Unknown person",
        distance: lowestDistance,
      });
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
