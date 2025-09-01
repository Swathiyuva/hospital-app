// src/components/Login.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Auth.css";
import doctorImg from "../../assets/doctor-login.png";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// AWS SDK
import { ddbClient } from "../../aws-config";
import { ScanCommand } from "@aws-sdk/client-dynamodb";

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    identifier: "",
    password: "",
    role: "",
  });
  const [error, setError] = useState(""); // ❌ will only be set after submit

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // reset error on every submit

    try {
      // ✅ scan correct DynamoDB table
      const scanResult = await ddbClient.send(
        new ScanCommand({ TableName: "Users_table" })
      );
      const users = scanResult.Items || [];

      // Convert DynamoDB format {S: "value"} → plain JS object
      const userList = users.map((u) => ({
        username: u.username?.S,
        email: u.email?.S,
        password: u.password?.S,
        role: u.role?.S,
      }));

      // ✅ Match user
      const user = userList.find(
        (u) =>
          (u.email === form.identifier || u.username === form.identifier) &&
          u.password === form.password &&
          u.role === form.role
      );

      if (!user) {
        setError("❌ Invalid credentials or role");
        toast.error("❌ Invalid credentials or role");
        return;
      }

      // ✅ Save logged-in user in localStorage
      localStorage.setItem("loggedInUser", JSON.stringify(user));

      toast.success(`✅ Welcome back, ${user.username} (${user.role})!`);
      navigate("/dashboard");
    } catch (err) {
      console.error("Error fetching users from DynamoDB:", err);
      setError("❌ Failed to connect to DynamoDB");
      toast.error("❌ Failed to connect to DynamoDB. Check AWS credentials.");
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-image">
        <img src={doctorImg} alt="Doctor Login" />
      </div>
      <div className="auth-form-container">
        <form className="auth-form" onSubmit={handleSubmit}>
          <h2>Welcome Back</h2>
          <p className="subtitle">Login to your Smart Health Record System</p>

          <input
            type="text"
            name="identifier"
            placeholder="Username or Email"
            value={form.identifier}
            onChange={handleChange}
            autoComplete="on" 
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            autoComplete="new-password"
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

          {/* only show error if it exists */}
          {error && <p className="error-text">{error}</p>}

          <button type="submit">Login</button>
          <p>
            Don’t have an account?{" "}
            <span className="link" onClick={() => navigate("/register")}>
              Register
            </span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
