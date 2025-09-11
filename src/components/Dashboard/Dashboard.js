// src/components/Dashboard/Dashboard.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../style.css";
import { ScanCommand } from "@aws-sdk/client-dynamodb";
import { ddbClient } from "../../aws-config";
import Navbar from "../Navbar"; // ✅ import Navbar

const Dashboard = () => {
  const today = new Date().toLocaleDateString();
  const navigate = useNavigate();

  const [totalPatients, setTotalPatients] = useState(null);
  const [totalReports, setTotalReports] = useState(null);
  const [totalVisits, setTotalVisits] = useState(
    parseInt(localStorage.getItem("totalVisits")) || 0
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const patientsData = await ddbClient.send(
          new ScanCommand({ TableName: "Patients", Select: "COUNT" })
        );
        setTotalPatients(patientsData.Count || 0);

        const reportsData = await ddbClient.send(
          new ScanCommand({ TableName: "Reports", Select: "COUNT" })
        );
        setTotalReports(reportsData.Count || 0);
      } catch (error) {
        console.error("❌ Error fetching data:", error);
        setTotalPatients(0);
        setTotalReports(0);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      setTotalVisits(parseInt(localStorage.getItem("totalVisits")) || 0);
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const healthTips = [
    "Drink at least 8 glasses of water a day 💧",
    "Take a 10-minute walk after meals 🚶‍♀️",
    "Eat more colorful fruits and veggies 🥦🍎",
    "Take deep breaths to reduce stress 😌",
    "Sleep at least 7–8 hours each night 🌙",
    "Limit sugary drinks and processed foods 🥤❌",
    "Stretch your body every morning to stay flexible 🧘‍♂️",
    "Take the stairs instead of the elevator whenever possible 🏃‍♀️",
    "Protect your eyes by following the 20-20-20 rule 👀",
    "Keep a consistent sleep routine ⏰",
    "Practice gratitude daily for better mental health 🙏",
    "Avoid sitting for long hours—stand up and move around 💺➡️🏃",
    "Include protein-rich foods in your diet for energy 🍳🥩",
    "Spend time outdoors to get natural Vitamin D 🌞",
    "Listen to your body and rest when you feel tired 😴",
    "Stay connected with family and friends 🤝",
    "Wash your hands often to prevent illness 🧼",
    "Try meditation or mindfulness for inner calm 🧘‍♀️",
    "Laugh more—it boosts immunity and mood 😂",
    "Schedule regular health checkups 🏥",
  ];

  const randomTip = healthTips[Math.floor(Math.random() * healthTips.length)];

  return (
    <div className="dashboard double-light-bg">
      {/* ✅ Navbar on top */}
      <Navbar />

      <h1 className="dashboard-title">Smart Health Record System</h1>

      {/* Navigation Buttons */}
      <div className="button-container">
        <button className="dashboard-btn" onClick={() => navigate("/add-patient")}>
          ➕ Add Patient
        </button>
        <button className="dashboard-btn" onClick={() => navigate("/patient-list")}>
          📋 View Patients
        </button>
        <button className="dashboard-btn" onClick={() => navigate("/upload-report")}>
          📤 Upload Report
        </button>
        <button className="dashboard-btn" onClick={() => navigate("/view-reports")}>
          📄 View Reports
        </button>
      </div>

      {/* Summary Cards */}
      <div className="metrics">
        <div className="card metric-card">
          <span className="icon">🧑‍⚕️</span>
          <h3>Total Patients</h3>
          <p>{totalPatients === null ? "Loading..." : totalPatients}</p>
        </div>
        <div className="card metric-card">
          <span className="icon">📋</span>
          <h3>Today's Visits</h3>
          <p>{totalVisits}</p>
        </div>
        <div className="card metric-card">
          <span className="icon">📁</span>
          <h3>Reports Uploaded</h3>
          <p>{totalReports === null ? "Loading..." : totalReports}</p>
        </div>
      </div>

      {/* Health Tip */}
      <div className="tip-section">
        <h2 className="tip-heading">🌟 Health Tip of the Day</h2>
        <p className="tip-text">{randomTip}</p>
        <p className="tip-date">📅 {today}</p>
      </div>
    </div>
  );
};

export default Dashboard;
