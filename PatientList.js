// src/components/Patients/PatientList.js
import React, { useEffect, useState } from "react";
import "../../style.css";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';

const PatientList = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    const storedPatients = JSON.parse(localStorage.getItem("patients")) || [];
    setPatients(storedPatients);
  }, []);

  const handleBack = () => {
    navigate('/dashboard');
  };

  const handleEdit = (index) => {
    setEditingIndex(index);
    setEditData(patients[index]);
  };

  const handleChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleSave = (index) => {
    const updated = [...patients];
    updated[index] = editData;
    setPatients(updated);
    localStorage.setItem("patients", JSON.stringify(updated));
    setEditingIndex(null);
    toast.success("✏️ Patient updated successfully");
  };

  const handleDelete = (index) => {
    const updatedPatients = [...patients];
    updatedPatients.splice(index, 1);
    setPatients(updatedPatients);
    localStorage.setItem('patients', JSON.stringify(updatedPatients));
    toast.info("🗑️ Patient record deleted.");
  };

  const markAsViewed = (index) => {
    const updatedPatients = [...patients];
    updatedPatients[index].viewed = true;
    setPatients(updatedPatients);
    localStorage.setItem("patients", JSON.stringify(updatedPatients));
    toast.info("👁️ Marked as viewed.");
  };

  return (
    <div className="list-container">
      <div className="page-container">
        <h2>Patient List</h2>
        {patients.length === 0 ? (
          <p>No patients added yet.</p>
        ) : (
          <table className="patient-table">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Full Name</th>
                <th>Age</th>
                <th>Gender</th>
                <th>Condition</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((patient, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  {editingIndex === index ? (
                    <>
                      <td>
                        <input
                          type="text"
                          name="fullName"
                          value={editData.fullName}
                          onChange={handleChange}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          name="age"
                          value={editData.age}
                          onChange={handleChange}
                        />
                      </td>
                      <td>
                        <select
                          name="gender"
                          value={editData.gender}
                          onChange={handleChange}
                        >
                          <option>Male</option>
                          <option>Female</option>
                          <option>Other</option>
                        </select>
                      </td>
                      <td>
                        <input
                          type="text"
                          name="condition"
                          value={editData.condition}
                          onChange={handleChange}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          name="phone"
                          value={editData.phone}
                          onChange={handleChange}
                        />
                      </td>
                      <td colSpan="2">
                        <button className="save-btn" onClick={() => handleSave(index)}>💾 Save</button>
                        <button onClick={() => setEditingIndex(null)}>❌ Cancel</button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>{patient.fullName}</td>
                      <td>{patient.age}</td>
                      <td>{patient.gender}</td>
                      <td>{patient.condition}</td>
                      <td>{patient.phone}</td>
                      <td className={patient.viewed ? "viewed" : "not-viewed"}>
                        {patient.viewed ? "Viewed" : "Not Viewed"}
                      </td>
                      <td>
                        <button className="edit-btn" onClick={() => handleEdit(index)}>✏️ Edit</button>
                        <button className="delete-btn" onClick={() => handleDelete(index)}>🗑️ Delete</button>
                        {!patient.viewed && (
                          <button className="viewed-btn" onClick={() => markAsViewed(index)}>👁️ Mark Viewed</button>
                        )}
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div className="button-container">
          <button className="back-button" onClick={handleBack}>
            ⬅️ Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default PatientList;