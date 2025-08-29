// src/components/Patients/PatientList.js
import React, { useEffect, useState } from "react";
import { ScanCommand, UpdateItemCommand, DeleteItemCommand } from "@aws-sdk/client-dynamodb";
import { ddbClient } from "../../aws-config";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import "../../style.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const PatientList = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editIndex, setEditIndex] = useState(null); // track row being edited
  const [editData, setEditData] = useState({}); // temporary edit state

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const data = await ddbClient.send(new ScanCommand({ TableName: "Patients" }));
        const formatted = data.Items.map((item) => unmarshall(item));
        setPatients(formatted);
      } catch (error) {
        console.error("Failed to fetch patients", error);
        toast.error("⚠️ Could not load patients");
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);
const markAsViewed = async (patientId, index) => {
  try {
    await ddbClient.send(
      new UpdateItemCommand({
        TableName: "Patients",
        Key: { patientId: { S: patientId } },
        UpdateExpression: "SET viewed = :v",
        ExpressionAttributeValues: {
          ":v": { BOOL: true },
        },
      })
    );

    const updated = [...patients];
    if (!updated[index].viewed) {
      // Only increment if it wasn’t already viewed
      let visits = parseInt(localStorage.getItem("totalVisits")) || 0;
      visits += 1;
      localStorage.setItem("totalVisits", visits);
    }
    updated[index].viewed = true;
    setPatients(updated);

    toast.success("👁️ Marked as viewed");
  } catch (err) {
    console.error("Error updating viewed status:", err);
    toast.error("❌ Failed to update status");
  }
};


  const handleEdit = (index) => {
    setEditIndex(index);
    setEditData(patients[index]); // preload row data
  };

  const handleCancelEdit = () => {
    setEditIndex(null);
    setEditData({});
  };

  const handleSave = async (patientId, index) => {
    try {
      await ddbClient.send(
        new UpdateItemCommand({
          TableName: "Patients",
          Key: { patientId: { S: patientId } },
          UpdateExpression:
            "SET fullName = :n, age = :a, gender = :g, #cond = :c, phone = :p",
          ExpressionAttributeNames: { "#cond": "condition" },
          ExpressionAttributeValues: {
            ":n": { S: editData.fullName },
            ":a": { N: String(editData.age) },
            ":g": { S: editData.gender },
            ":c": { S: editData.condition },
            ":p": { S: editData.phone },
          },
        })
      );

      const updated = [...patients];
      updated[index] = { ...editData, patientId };
      setPatients(updated);

      toast.success("✅ Patient updated");
      setEditIndex(null);
    } catch (err) {
      console.error("Error updating patient:", err);
      toast.error("❌ Failed to update patient");
    }
  };

  const handleDelete = async (patientId) => {
    try {
      await ddbClient.send(
        new DeleteItemCommand({
          TableName: "Patients",
          Key: { patientId: { S: patientId } },
        })
      );

      setPatients((prev) => prev.filter((p) => p.patientId !== patientId));
      toast.success("🗑️ Patient deleted");
    } catch (err) {
      console.error("Error deleting patient:", err);
      toast.error("❌ Failed to delete patient");
    }
  };

  return (
    <div className="list-container">
      <div className="page-container">
        <h2>Patient List</h2>
        {loading ? (
          <p>Loading patients...</p>
        ) : patients.length === 0 ? (
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
              {patients.map((p, index) => (
                <tr key={p.patientId}>
                  <td>{index + 1}</td>
                  <td>
                    {editIndex === index ? (
                      <input
                        value={editData.fullName}
                        onChange={(e) =>
                          setEditData({ ...editData, fullName: e.target.value })
                        }
                      />
                    ) : (
                      p.fullName
                    )}
                  </td>
                  <td>
                    {editIndex === index ? (
                      <input
                        type="number"
                        value={editData.age}
                        onChange={(e) =>
                          setEditData({ ...editData, age: e.target.value })
                        }
                      />
                    ) : (
                      p.age
                    )}
                  </td>
                  <td>
                    {editIndex === index ? (
                      <select
                        value={editData.gender}
                        onChange={(e) =>
                          setEditData({ ...editData, gender: e.target.value })
                        }
                      >
                        <option>Male</option>
                        <option>Female</option>
                        <option>Other</option>
                      </select>
                    ) : (
                      p.gender
                    )}
                  </td>
                  <td>
                    {editIndex === index ? (
                      <input
                        value={editData.condition}
                        onChange={(e) =>
                          setEditData({ ...editData, condition: e.target.value })
                        }
                      />
                    ) : (
                      p.condition
                    )}
                  </td>
                  <td>
                    {editIndex === index ? (
                      <input
                        value={editData.phone}
                        onChange={(e) =>
                          setEditData({ ...editData, phone: e.target.value })
                        }
                      />
                    ) : (
                      p.phone
                    )}
                  </td>
                  <td>
                    {p.viewed ? (
                      <span className="viewed">👁️ Viewed</span>
                    ) : (
                      <button
                        className="viewed-btn"
                        onClick={() => markAsViewed(p.patientId, index)}
                      >
                        👁️ Mark Viewed
                      </button>
                    )}
                  </td>
                  <td>
  {editIndex === index ? (
    <>
      <button
        className="actions-btn save-btn"
        onClick={() => handleSave(p.patientId, index)}
      >
        💾 Save
      </button>
      <button className="actions-btn cancel-btn" onClick={handleCancelEdit}>
        ❌ Cancel
      </button>
    </>
  ) : (
    <>
      <button className="actions-btn edit-btn" onClick={() => handleEdit(index)}>
        ✏️ Edit
      </button>
      <button
        className="actions-btn delete-btn"
        onClick={() => handleDelete(p.patientId)}
      >
        🗑️ Delete
      </button>
    </>
  )}
</td>

                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="button-container">
          <button className="back-button" onClick={() => navigate("/dashboard")}>
            ⬅️ Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default PatientList;
