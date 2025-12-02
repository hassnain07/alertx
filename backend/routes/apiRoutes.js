const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload");
const { uploadAndCompare } = require("../controllers/GateDevController");
const authController = require("../controllers/authController");

router.post("/api/register", authController.registerUser);
router.post("/api/login", authController.loginUser);

router.post("/api/upload-image", upload.single("image"), uploadAndCompare);

module.exports = router;
