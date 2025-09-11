// src/components/Register.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Auth.css";
import doctorImg from "../../assets/doctor-login.png";
import { ddbClient } from "../../aws-config";
import {
  PutItemCommand,
  ScanCommand,
} from "@aws-sdk/client-dynamodb";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
  });
  const [error, setError] = useState("");
  const [existingUsers, setExistingUsers] = useState([]);
  useEffect(() => {
    setExistingUsers([]);
  }, []);
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // ✅ Validation
    if (!form.username || !form.email || !form.password || !form.confirmPassword) {
      setError("⚠️ All fields are required!");
      toast.error("⚠️ All fields are required!");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("⚠️ Passwords do not match!");
      toast.error("⚠️ Passwords do not match!");
      return;
    }

    try {
      // ✅ FIXED: use the same table name for scanning
      const scanResult = await ddbClient.send(
        new ScanCommand({ TableName: "Users_table" })
      );
      const users = scanResult.Items || [];

      const userList = users.map((u) => ({
        username: u.username?.S,
        email: u.email?.S,
        role: u.role?.S,
      }));

      // ✅ Check if user already exists
      const userExists = userList.find(
        (u) => u.email === form.email || u.username === form.username
      );

      if (userExists) {
        setExistingUsers(userList);
        setError("⚠️ User already exists in DynamoDB!");
        toast.warning("⚠️ User already exists in DynamoDB!");
        return;
      }

      // ✅ Add user
      const params = {
        TableName: "Users_table",
        Item: {
          userId: { S: Date.now().toString() },
          username: { S: form.username },
          email: { S: form.email },
          password: { S: form.password },
          role: { S: form.role },
        },
      };

      await ddbClient.send(new PutItemCommand(params));

      toast.success("✅ Registration Successful!");
      navigate("/");
    } catch (err) {
      console.error("Error saving to DynamoDB:", err);
      setError("❌ Failed to register user. Check AWS credentials.");
      toast.error("❌ Failed to register user. Check AWS credentials.");
    }
  };

  // ✅ Optional: clear ghost users from UI
  const clearExistingUsers = () => {
    setExistingUsers([]);
    toast.info("Cleared old user list from UI.");
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-image">
        <img src={doctorImg} alt="Doctor Register" />
      </div>
      <div className="auth-form-container">
        <form className="auth-form" onSubmit={handleSubmit}>
          <h2>Create Account</h2>
          <p className="subtitle">Register to your Smart Health Record System</p>

          <input
            type="text"
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={form.confirmPassword}
            onChange={handleChange}
            required
          />

          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            required
          >
             <option value="" disabled>
                -- Select Role --
             </option>
            <option value="doctor">Doctor</option>
            <option value="surgeon">Surgeon</option>
            <option value="chief_doctor">Chief Doctor</option>
          </select>

          {error && <p className="error-text">{error}</p>}

          <button type="submit">Register</button>
          <p>
            Already have an account?{" "}
            <span className="link" onClick={() => navigate("/")}>
              Login
            </span>
          </p>
        </form>

        {existingUsers.length > 0 && (
          <div className="registered-users">
            <h3>👥 Already Registered Users</h3>
            <ul>
              {existingUsers.map((u, i) => (
                <li key={i}>
                  {u.username} ({u.email}) - {u.role}
                </li>
              ))}
            </ul>
            <button onClick={clearExistingUsers} className="clear-btn">
              Clear Users List
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Register;
