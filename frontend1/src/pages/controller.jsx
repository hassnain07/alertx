import React, { useState } from "react";

function Controller() {
  const [doorStatus, setDoorStatus] = useState("locked");
  const [alarmStatus, setAlarmStatus] = useState("armed");

  const toggleDoor = (action) => {
    setDoorStatus(action === "lock" ? "locked" : "unlocked");
    alert(`Door ${action}ed successfully!`);
  };

  const toggleAlarm = (action) => {
    setAlarmStatus(action === "enable" ? "armed" : "disarmed");
    alert(`Alarm ${action}d successfully!`);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>System Controls</h1>
        <p>Manage your security system</p>
      </div>

      <div className="card-grid">
        <div className="card">
          <h3>🚪 Door Control</h3>
          <p>
            <strong>Current Status:</strong> 
            <span className={`badge ${doorStatus === "locked" ? "badge-success" : "badge-warning"}`}>
              {doorStatus.charAt(0).toUpperCase() + doorStatus.slice(1)}
            </span>
          </p>
          <div className="btn-group">
            <button 
              className="btn-success" 
              onClick={() => toggleDoor("lock")}
            >
              🔒 Lock Door
            </button>
            <button 
              className="btn-warning" 
              onClick={() => toggleDoor("unlock")}
            >
              🔓 Unlock Door
            </button>
          </div>
        </div>

        <div className="card">
          <h3>🔔 Alarm Control</h3>
          <p>
            <strong>Current Status:</strong> 
            <span className={`badge ${alarmStatus === "armed" ? "badge-success" : "badge-warning"}`}>
              {alarmStatus.charAt(0).toUpperCase() + alarmStatus.slice(1)}
            </span>
          </p>
          <div className="btn-group">
            <button 
              className="btn-success" 
              onClick={() => toggleAlarm("enable")}
            >
              ✓ Enable Alarm
            </button>
            <button 
              className="btn-danger" 
              onClick={() => toggleAlarm("disable")}
            >
              ✗ Disable Alarm
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        <h3>⚙️ Advanced Settings</h3>
        <div className="form-group">
          <label htmlFor="sensitivity">Alarm Sensitivity</label>
          <input 
            type="range" 
            id="sensitivity" 
            min="1" 
            max="100" 
            defaultValue="50"
          />
        </div>
        <div className="form-group">
          <label htmlFor="delay">Door Lock Delay (seconds)</label>
          <input 
            type="number" 
            id="delay" 
            min="0" 
            max="300" 
            defaultValue="30"
          />
        </div>
        <button className="btn-primary">Save Settings</button>
      </div>
    </div>
  );
}

export default Controller;
