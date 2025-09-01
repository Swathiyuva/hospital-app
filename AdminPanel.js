// src/components/AdminPanel.js
import React, { useEffect, useState } from "react";
import { ScanCommand } from "@aws-sdk/client-dynamodb";
import { ddbClient } from "../aws-config";
import { deleteUser } from "../services/userService";
import "../style.css";

const TABLE_NAME = "Users"; // replace with your table name

function AdminPanel() {
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    try {
      const data = await ddbClient.send(new ScanCommand({ TableName: TABLE_NAME }));
      const userList = data.Items.map(item => ({
        username: item.username.S,
        email: item.email.S
      }));
      setUsers(userList);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const handleDelete = async (username) => {
    if (window.confirm(`Are you sure you want to delete user: ${username}?`)) {
      const result = await deleteUser(username);
      if (result.success) {
        setUsers(users.filter(user => user.username !== username));
        alert("User deleted successfully!");
      } else {
        alert("Error deleting user!");
      }
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="admin-container">
      <h2>User Management</h2>
      <table>
        <thead>
          <tr>
            <th>Username</th>
            <th>Email</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.username}>
              <td>{user.username}</td>
              <td>{user.email}</td>
              <td>
                <button onClick={() => handleDelete(user.username)} className="delete-btn">
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminPanel;
