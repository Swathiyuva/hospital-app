
// src/components/Patients/PatientForm.js
import React, { useState } from "react";
import "../../style.css";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import { PutItemCommand } from "@aws-sdk/client-dynamodb";
import { ddbClient } from "../../aws-config";
import { v4 as uuidv4 } from "uuid";

const PatientForm = () => {
  const [form, setForm] = useState({
    fullName: "",
    age: "",
    gender: "",
    condition: "",
    phone: "",
  });

  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/dashboard');
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  const { fullName, age, gender, condition, phone } = form;

  if (!fullName || !age || !gender || !condition || !phone) {
    toast.error("❌ Please fill in all fields.");
    return;
  }

  const patientId = uuidv4();
  const params = {
    TableName: "Patients",
    Item: {
      patientId: { S: patientId },
      fullName: { S: fullName },
      age: { N: age.toString() },
      gender: { S: gender },
      condition: { S: condition },
      phone: { S: phone },
      createdAt: { S: new Date().toISOString() },
    },
  };

  try {
    await ddbClient.send(new PutItemCommand(params));
    toast.success("✅ Patient added to DynamoDB!");
    navigate('/dashboard');
  } catch (error) {
    console.error("Error saving patient:", error);
    toast.error("❌ Failed to save patient.");
  }
};

  return (
    <div className="form-container">
      <div className="page-container">
        <h2>Add New Patient</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="fullName"
            placeholder="Full Name"
            value={form.fullName}
            onChange={handleChange}
            required
          />
          <input
            type="number"
            name="age"
            placeholder="Age"
            value={form.age}
            onChange={handleChange}
            required
          />
          <select
            name="gender"
            value={form.gender}
            onChange={handleChange}
            required
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
          <input
            type="text"
            name="condition"
            placeholder="Condition"
            value={form.condition}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="phone"
            placeholder="Phone Number"
            value={form.phone}
            onChange={handleChange}
            required
          />
          <button type="submit">💾 Save Patient</button>
        </form>

        <div className="button-container">
          <button className="back-button" onClick={handleBack}>
            ⬅️ Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default PatientForm;
