import React, { useState, useEffect } from "react";
import { useAuthStore } from "../stores/useAuthStore";

function UserManager() {
  const { users, loading, error, fetchUsers } = useAuthStore();

  const [editingId, setEditingId] = useState(null);
  const [editRole, setEditRole] = useState("");

  const deleteUser = (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      setUsers(users.filter((user) => user.id !== id));
      alert("User deleted successfully!");
    }
  };

  const startEdit = (user) => {
    setEditingId(user.id);
    setEditRole(user.role);
  };

  const saveEdit = (id) => {
    setUsers(
      users.map((user) => (user.id === id ? { ...user, role: editRole } : user))
    );
    setEditingId(null);
    alert("Role updated successfully!");
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>User Management</h1>
        <p>Manage system users and permissions</p>
      </div>

      <div className="card">
        <div className="card-header-flex">
          <h3>Active Users</h3>
        </div>

        {loading && <p>Loading users...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}

        {!loading && (
          <table className="styled-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center" }}>
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <strong>{user.name}</strong>
                    </td>
                    <td>{user.email}</td>

                    <td>
                      {editingId === user.id ? (
                        <select
                          value={editRole}
                          onChange={(e) => setEditRole(e.target.value)}
                          className="select-role"
                        >
                          <option value="User">User</option>
                          <option value="Admin">Admin</option>
                          <option value="Security">Security Officer</option>
                          <option value="Viewer">Viewer</option>
                        </select>
                      ) : (
                        <strong>{user.role}</strong>
                      )}
                    </td>

                    <td>
                      <span
                        className={`badge ${
                          user.status === "Active"
                            ? "badge-success"
                            : "badge-danger"
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>

                    <td>
                      <div className="btn-group">
                        {editingId === user.id ? (
                          <>
                            <button
                              className="btn-success btn-small"
                              onClick={() => saveEdit(user.id)}
                            >
                              Save
                            </button>

                            <button
                              className="btn-secondary btn-small"
                              onClick={cancelEdit}
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              className="btn-secondary btn-small"
                              onClick={() => startEdit(user)}
                            >
                              Edit
                            </button>

                            <button
                              className="btn-danger btn-small"
                              onClick={() => deleteUser(user.id)}
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default UserManager;
