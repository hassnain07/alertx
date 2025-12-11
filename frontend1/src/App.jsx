import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";
import "./App.css";
import { useEffect } from "react";

import Dashboard from "./pages/Dashboard.jsx";
import Registration from "./pages/registration.jsx";
import Controller from "./pages/controller.jsx";
import UserManager from "./pages/userManager.jsx";
import CamImages from "./pages/CamImages.jsx";

import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";

import ProtectedRoute from "./components/ProtectedRoute";
import { useAuthStore } from "./stores/useAuthStore";

export default function App() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const restoreSession = useAuthStore((state) => state.restoreSession);

  // Restore login session on refresh
  useEffect(() => {
    restoreSession();
  }, []);

  const handleLogout = () => {
    logout();
  };

  const isLoggedIn = !!user;

  return (
    <BrowserRouter>
      {/* Show Navbar only when logged in */}
      {isLoggedIn && (
        <nav className="navbar">
          <span
            style={{ color: "white", fontWeight: "bold", marginRight: "auto" }}
          >
            Alert.X | Welcome {user?.name}
          </span>

          <Link to="/">Dashboard</Link>
          <Link to="/registration">Registration</Link>
          <Link to="/controller">Controller</Link>
          <Link to="/userManager">User Manager</Link>
          <Link to="/camImgs">Cam Images</Link>

          <button
            onClick={handleLogout}
            style={{
              background: "rgba(255,255,255,0.2)",
              border: "none",
              color: "white",
              padding: "0.5rem 1rem",
              borderRadius: "0.5rem",
              cursor: "pointer",
              fontWeight: "500",
              transition: "all 0.3s ease",
            }}
            onMouseOver={(e) =>
              (e.target.style.background = "rgba(255,255,255,0.3)")
            }
            onMouseOut={(e) =>
              (e.target.style.background = "rgba(255,255,255,0.2)")
            }
          >
            Logout
          </button>
        </nav>
      )}

      <Routes>
        {/* Public Routes */}
        {!isLoggedIn && (
          <>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </>
        )}

        {/* Protected Routes */}
        {isLoggedIn && (
          <>
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/registration"
              element={
                <ProtectedRoute>
                  <Registration />
                </ProtectedRoute>
              }
            />

            <Route
              path="/controller"
              element={
                <ProtectedRoute>
                  <Controller />
                </ProtectedRoute>
              }
            />

            <Route
              path="/userManager"
              element={
                <ProtectedRoute>
                  <UserManager />
                </ProtectedRoute>
              }
            />

            <Route
              path="/camImgs"
              element={
                <ProtectedRoute>
                  <CamImages />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" />} />
          </>
        )}
      </Routes>
    </BrowserRouter>
  );
}
