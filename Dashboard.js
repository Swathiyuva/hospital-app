import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../style.css';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const today = new Date().toLocaleDateString();
  const navigate = useNavigate();

  const [totalPatients, setTotalPatients] = useState(0);
  const [totalReports, setTotalReports] = useState(0);

  useEffect(() => {
    const patients = JSON.parse(localStorage.getItem('patients')) || [];
    const reports = JSON.parse(localStorage.getItem('reports')) || [];

    setTotalPatients(patients.length);
    setTotalReports(reports.length);
  }, []);

  const healthTips = [
    "Drink at least 8 glasses of water a day 💧",
    "Take a 10-minute walk after meals 🚶‍♀️",
    "Eat more colorful fruits and veggies 🥦🍎",
    "Take deep breaths to reduce stress 😌",
    "Sleep at least 7–8 hours each night 🌙"
  ];
  const randomTip = healthTips[Math.floor(Math.random() * healthTips.length)];

  return (
    <div className="dashboard double-light-bg">
      <h1 className="dashboard-title">Welcome to Smart Health Dashboard</h1>

      {/* Navigation Buttons */}
      <div className="button-container">
        <button className="dashboard-btn" onClick={() => navigate('/add-patient')}>➕ Add Patient</button>
        <button className="dashboard-btn" onClick={() => navigate('/patient-list')}>📋 View Patients</button>
        <button className="dashboard-btn" onClick={() => navigate('/upload-report')}>📤 Upload Report</button>
        <button className="dashboard-btn" onClick={() => navigate('/view-reports')}>📄 View Reports</button>
      </div>

      {/* Summary Cards */}
      <div className="metrics">
        <div className="card metric-card">
          <span className="icon">🧑‍⚕️</span>
          <h3>Total Patients</h3>
          <p>{totalPatients}</p>
        </div>
        <div className="card metric-card">
          <span className="icon">📋</span>
          <h3>Today's Visits</h3>
          <p>{Math.floor(Math.random() * (totalPatients + 1))}</p>
        </div>
        <div className="card metric-card">
          <span className="icon">📁</span>
          <h3>Reports Uploaded</h3>
          <p>{totalReports}</p>
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
