const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload");
const { saveEsp32Image } = require("../controllers/GateDevController");
const authController = require("../controllers/authController");

router.post("/api/register", authController.registerUser);
router.post("/api/login", authController.loginUser);

router.post("/api/esp32/upload", upload.single("image"), saveEsp32Image);
router.get("/api/all", authController.getAllUsers);
router.post("/api/approve", (req, res) => {
  const { id } = req.body;

  db.promise()
    .query("UPDATE gate_events SET status = 'approved' WHERE id = ?", [id])
    .then(() => {
      // 1. Notify React Dashboard in real-time
      io.emit("event_status_changed", { id, status: "approved" });

      // 2. Send unlock command to NodeMCU
      axios
        .get("http://192.168.1.50/unlock") // change to your ESP IP
        .then(() => console.log("Door Unlocked"))
        .catch((err) => console.log("ESP Error:", err.message));

      res.json({ message: "Event approved" });
    })
    .catch((err) => res.status(500).json(err));
});

router.post("/api/reject", (req, res) => {
  const { id } = req.body;

  db.promise()
    .query("UPDATE gate_events SET status = 'rejected' WHERE id = ?", [id])
    .then(() => {
      io.emit("event_status_changed", { id, status: "rejected" });
      res.json({ message: "Event rejected" });
    })
    .catch((err) => res.status(500).json(err));
});

module.exports = router;
