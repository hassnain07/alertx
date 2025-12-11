import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:3000"); // adjust if needed

function Dashboard() {
  const [alerts, setAlerts] = useState([]);

  const handleApprove = async (id) => {
    try {
      await fetch("http://localhost:3000/api/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setAlerts((prev) => prev.filter((item) => item.id !== id));
      alert("Approved & Door Unlock Signal Sent");
    } catch (err) {
      console.log(err);
    }
  };

  const handleReject = async (id) => {
    try {
      await fetch("http://localhost:3000/api/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setAlerts((prev) => prev.filter((item) => item.id !== id));

      alert("Rejected & Logged");
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    socket.on("new_gate_event", (data) => {
      console.log("New Gate Event:", data);

      // Add alert to list
      setAlerts((prev) => [data, ...prev]);
    });

    return () => socket.off("new_gate_event");
  }, []);
  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Real-time system status and monitoring</p>
      </div>

      {/* REAL-TIME ALERT POPUPS */}
      <div className="container mt-4">
        <div className="row g-3">
          {alerts.map((event, index) => (
            <div className="col-md-4" key={index}>
              <div className="card shadow-sm border-0">
                <div className="card-header bg-danger text-white d-flex align-items-center">
                  <span className="me-2 fs-5">🚨</span>
                  <span className="fw-bold">New Gate Event</span>
                </div>

                <img
                  src={`http://localhost:5000/${event.image}`}
                  alt="Gate Event"
                  className="card-img-top"
                  style={{ height: "200px", objectFit: "cover" }}
                />

                <div className="card-body">
                  <p className="card-text mb-1">
                    <strong>Status:</strong> {event.status}
                  </p>

                  <p className="card-text text-muted">
                    <strong>Time:</strong>{" "}
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </p>

                  <button
                    className="btn btn-success btn-sm w-100 mt-2"
                    onClick={() => handleApprove(event.id)}
                  >
                    Approve
                  </button>

                  <button
                    className="btn btn-danger btn-sm w-100 mt-2"
                    onClick={() => handleReject(event.id)}
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card-grid">
        <div className="card">
          <h3>📹 Camera Status</h3>
          <p>
            <strong>Status:</strong>{" "}
            <span className="badge badge-success">Active</span>
          </p>
          <p>
            <strong>Last Updated:</strong> 2 minutes ago
          </p>
          <p>
            <strong>Resolution:</strong> 1080p
          </p>
        </div>

        <div className="card">
          <h3>🚪 Door System</h3>
          <p>
            <strong>Status:</strong>{" "}
            <span className="badge badge-success">Online</span>
          </p>
          <p>
            <strong>Lock Status:</strong>{" "}
            <span className="badge badge-success">Locked</span>
          </p>
          <p>
            <strong>Last Action:</strong> Locked at 10:30 AM
          </p>
        </div>

        <div className="card">
          <h3>🔔 Alarm System</h3>
          <p>
            <strong>Status:</strong>{" "}
            <span className="badge badge-success">Armed</span>
          </p>
          <p>
            <strong>Mode:</strong> Night Mode
          </p>
          <p>
            <strong>Alert Level:</strong> Normal
          </p>
        </div>
      </div>

      <div className="card">
        <h3>📊 Recent Activity Logs</h3>
        <table>
          <thead>
            <tr>
              <th>Time</th>
              <th>Event</th>
              <th>User</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>10:30 AM</td>
              <td>User entered building</td>
              <td>John Doe</td>
              <td>
                <span className="badge badge-success">Success</span>
              </td>
            </tr>
            <tr>
              <td>10:15 AM</td>
              <td>Door lock activated</td>
              <td>System</td>
              <td>
                <span className="badge badge-success">Success</span>
              </td>
            </tr>
            <tr>
              <td>09:58 AM</td>
              <td>Door unlocked</td>
              <td>Admin</td>
              <td>
                <span className="badge badge-success">Success</span>
              </td>
            </tr>
            <tr>
              <td>09:30 AM</td>
              <td>Unauthorized access attempt</td>
              <td>Unknown</td>
              <td>
                <span className="badge badge-warning">Blocked</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Dashboard;
