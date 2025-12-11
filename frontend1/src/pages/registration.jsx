import React, { useState } from "react";
import FaceCapture from "../components/FaceCapture";
import api from "../services/api";

const RegistrationPage = () => {
  const [user, setUser] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [vector, setVector] = useState(null);
  const [status, setStatus] = useState("");

  const API_URL = import.meta.env.VITE_API_URL;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!vector) return alert("Please capture face before registering!");
    if (!user.name || !user.email || !user.password)
      return alert("All fields are required");
    if (user.password !== user.confirmPassword)
      return alert("Passwords do not match!");

    try {
      const res = await api.post(`http://localhost:3000/api/register`, {
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
    <div className="page-container">
      <div className="page-header">
        <h1>User Registration</h1>
        <p>Register a new user to the system</p>
      </div>

      <div className="card" style={{ maxWidth: "600px", margin: "0 auto" }}>
        <form onSubmit={handleSubmit}>
          {/* Full Name */}
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Enter full name"
              value={user.name}
              onChange={handleChange}
              required
            />
          </div>

          {/* Email */}
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter email address"
              value={user.email}
              onChange={handleChange}
              required
            />
          </div>

          {/* Password */}
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Enter password"
              value={user.password}
              onChange={handleChange}
              required
            />
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              placeholder="Confirm password"
              value={user.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          {/* FACE CAPTURE COMPONENT */}
          <div className="form-group">
            <label>Face Capture</label>
            <FaceCapture onVectorReady={(v) => setVector(v)} />
          </div>

          {/* Buttons */}
          <div className="btn-group">
            <button type="submit" className="btn-primary btn-large">
              Register User
            </button>

            <button
              type="reset"
              className="btn-outline btn-large"
              onClick={() => {
                setUser({
                  name: "",
                  email: "",
                  password: "",
                  confirmPassword: "",
                });
                setVector(null);
                setStatus("");
              }}
            >
              Clear Form
            </button>
          </div>
        </form>

        {/* Status Message */}
        <p style={{ marginTop: 15, fontWeight: "bold" }}>{status}</p>
      </div>
    </div>
  );
};

export default RegistrationPage;
