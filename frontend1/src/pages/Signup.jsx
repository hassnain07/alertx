import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function Signup({ onSignup }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSignup = (e) => {
    e.preventDefault();
    
    // Check if email already exists
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    if (users.some(u => u.email === formData.email)) {
      alert("Email already registered!");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    if (formData.password.length < 6) {
      alert("Password must be at least 6 characters!");
      return;
    }

    onSignup(formData);
    navigate("/login");
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>🔐 Create Account</h1>
        <p>Sign up for Alert.X security system</p>
      </div>

      <div className="card" style={{ maxWidth: "500px", margin: "0 auto" }}>
        <form onSubmit={handleSignup}>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Create a password (min 6 characters)"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <div className="btn-group">
            <button type="submit" className="btn-primary btn-large">
              Create Account
            </button>
          </div>

          <p style={{ textAlign: "center", marginTop: "1.5rem", color: "var(--text-secondary)" }}>
            Already have an account? <Link to="/login" style={{ color: "var(--primary-color)", fontWeight: "bold" }}>Login here</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Signup;
