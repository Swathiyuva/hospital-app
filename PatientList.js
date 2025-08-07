// src/components/Patients/PatientList.js
import React, { useEffect, useState } from "react";
import { ScanCommand, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { ddbClient } from "../../aws-config";
import "../../style.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const PatientList = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true); // NEW

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const data = await ddbClient.send(
          new ScanCommand({ TableName: "Patients" })
        );
        const formatted = data.Items.map((item) => ({
          patientId: item.patientId.S,  
          fullName: item.fullName.S,
          age: item.age.N,
          gender: item.gender.S,
          condition: item.condition.S,
          phone: item.phone.S,
          viewed: item.viewed?.BOOL || false,
        }));
        setPatients(formatted);
      } catch (error) {
        console.error("Failed to fetch patients", error);
        toast.error("⚠️ Could not load patients");
      }
      finally {
      setLoading(false); // ✅ Done loading
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
      updated[index].viewed = true;
      setPatients(updated);

      toast.success("👁️ Marked as viewed");
    } catch (err) {
      console.error("Error updating viewed status:", err);
      toast.error("❌ Failed to update status");
    }
  };

  const handleBack = () => navigate('/dashboard');

  return (
    <div className="list-container">
      <div className="page-container">
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
              </tr>
            </thead>
            <tbody>
              {patients.map((p, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{p.fullName}</td>
                  <td>{p.age}</td>
                  <td>{p.gender}</td>
                  <td>{p.condition}</td>
                  <td>{p.phone}</td>
                  <td>
  {p.viewed ? (
    <span className="viewed">👁️ Viewed</span>
  ) : (
    <button className="viewed-btn" onClick={() => markAsViewed(p.patientId, index)}>
      👁️ Mark Viewed
    </button>
  )}
</td>

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
