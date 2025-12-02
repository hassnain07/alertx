import React, { useState } from "react";
import FaceCapture from "../components/FaceCapture";
import api from "../services/api";

const RegisterUser = () => {
  const [user, setUser] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [vector, setVector] = useState(null);
  const [status, setStatus] = useState("");
  const API_URL = import.meta.env.VITE_API_URL; // ENV variable

  const submitForm = async () => {
    if (!vector) {
      return alert("Please capture face before registering!");
    }

    if (!user.name || !user.email || !user.password) {
      return alert("All fields are required");
    }

    if (user.password !== user.confirmPassword) {
      return alert("Passwords do not match!");
    }

    try {
      const res = await api.post(`${API_URL}/register`, {
        name: user.name,
        email: user.email,
        password: user.password,
        faceEmbedding: vector,
      });

      setStatus(res.data.message);
    } catch (err) {
      setStatus(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "auto" }}>
      <h1>User Registration</h1>

      <input
        type="text"
        placeholder="Full Name"
        value={user.name}
        onChange={(e) => setUser({ ...user, name: e.target.value })}
        style={{ display: "block", width: "100%", marginBottom: 10 }}
      />

      <input
        type="email"
        placeholder="Email"
        value={user.email}
        onChange={(e) => setUser({ ...user, email: e.target.value })}
        style={{ display: "block", width: "100%", marginBottom: 10 }}
      />

      <input
        type="password"
        placeholder="Password"
        value={user.password}
        onChange={(e) => setUser({ ...user, password: e.target.value })}
        style={{ display: "block", width: "100%", marginBottom: 10 }}
      />

      <input
        type="password"
        placeholder="Confirm Password"
        value={user.confirmPassword}
        onChange={(e) => setUser({ ...user, confirmPassword: e.target.value })}
        style={{ display: "block", width: "100%", marginBottom: 20 }}
      />

      <FaceCapture onVectorReady={(v) => setVector(v)} />

      <button
        onClick={submitForm}
        style={{
          marginTop: 20,
          padding: "10px 20px",
          width: "100%",
          background: "black",
          color: "white",
          border: "none",
          cursor: "pointer",
        }}
      >
        Register User
      </button>

      <p style={{ marginTop: 20, fontWeight: "bold" }}>{status}</p>
    </div>
  );
};

export default RegisterUser;
