import React from "react";
import { useAuthStore } from "../stores/useAuthStore"; // adjust path

const Dashboard = () => {
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout(); // Clear store + localStorage
    window.location.href = "/"; // Redirect to login page
  };

  return (
    <div>
      <h1>Dashboard</h1>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Dashboard;
