const path = require("path");
const db = require("../config/db"); // mysql2 pool

exports.saveEsp32Image = async (req, res) => {
  try {
    if (!req.file) {
      return res.json({ success: false, message: "No image received" });
    }

    const savedPath = `uploads/gateDev/${req.file.filename}`;

    // Insert event in DB
    const [result] = await db.query(
      "INSERT INTO gate_events (image_path, status) VALUES (?, ?)",
      [savedPath, "unknown"]
    );

    // Emit real-time alert
    global.io.emit("new_gate_event", {
      id: result.insertId,
      image: savedPath,
      status: "unknown",
      timestamp: new Date(),
    });

    return res.json({
      success: true,
      message: "Image uploaded + event stored",
    });
  } catch (error) {
    console.error(error);
    return res.json({ success: false });
  }
};
