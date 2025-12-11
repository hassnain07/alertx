const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.registerUser = async (req, res) => {
  const { name, email, password, faceEmbedding } = req.body;

  //   if (!faceEmbedding || faceEmbedding.length !== 128) {
  //     return res.status(400).json({ error: "Invalid embedding" });
  //   }

  const hashedPassword = await bcrypt.hash(password, 10);

  const sql =
    "INSERT INTO users (name, email, password, face_embedding) VALUES (?, ?, ?, ?)";

  db.query(
    sql,
    [name, email, hashedPassword, JSON.stringify(faceEmbedding)],
    (err, result) => {
      if (err) return res.status(500).json({ error: err });

      return res.json({
        success: true,
        userId: result.insertId,
      });
    }
  );
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }

  const sql = "SELECT * FROM users WHERE email = ?";

  db.query(sql, [email], async (err, rows) => {
    if (err) return res.status(500).json({ error: err });

    // Email not found
    if (rows.length === 0) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const user = rows[0];

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    // ───────────────────────────────────────────
    //  GENERATE JWT TOKEN
    // ───────────────────────────────────────────
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || "SUPER_SECRET_KEY",
      { expiresIn: "7d" }
    );

    // ───────────────────────────────────────────
    // SUCCESS RESPONSE
    // ───────────────────────────────────────────
    return res.json({
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      token: token, // 🔥 Added token here
    });
  });
};

exports.getUserByEmail = (req, res) => {
  const email = req.body.email;

  const sql = "SELECT * FROM users WHERE email = ?";

  db.query(sql, [email], (err, rows) => {
    if (err) return res.status(500).json({ error: err });

    if (rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = rows[0];
    user.face_embedding = JSON.parse(user.face_embedding);

    res.json(user);
  });
};

exports.getAllUsers = (req, res) => {
  const sql = "SELECT id, name, email, face_embedding FROM users";

  db.query(sql, (err, rows) => {
    if (err) return res.status(500).json({ error: err });

    const users = rows.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      face_embedding: JSON.parse(u.face_embedding || "[]"),
    }));

    res.json({
      success: true,
      users,
    });
  });
};
