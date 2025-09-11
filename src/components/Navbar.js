// src/components/Navbar.js
import React from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("loggedInUser"); // clear session
    toast.info("👋 You have been logged out");
    navigate("/"); // redirect to login page
  };

  return (
    <nav className="navbar">
      <h2 className="navbar-title">Smart Health Record System</h2>
      <button onClick={handleLogout} className="logout-btn">
        🚪 Logout
      </button>
    </nav>
  );
};

export default Navbar;
