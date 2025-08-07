// src/components/Upload/ViewReports.js
import React, { useEffect, useState } from "react";
import { ScanCommand } from "@aws-sdk/client-dynamodb";
import { ddbClient } from "../../aws-config";
import "../../style.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const ViewReports = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true); // NEW

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const data = await ddbClient.send(
          new ScanCommand({ TableName: "Reports" })
        );
        const formatted = data.Items.map((item) => ({
          name: item.name.S,
          s3Key: item.s3Key.S,
          contentType: item.contentType.S,
        }));
        setReports(formatted);
      } catch (error) {
        console.error("Error loading reports:", error);
        toast.error("⚠️ Failed to fetch reports");
      }
      finally {
      setLoading(false); // ✅ Done loading
    }
    };

    fetchReports();
  }, []);

  const viewFile = async (s3Key, contentType) => {
    try {
      const s3Url = `https://shrs-health-reports.s3.us-east-1.amazonaws.com/${s3Key}`;
      window.open(s3Url, "_blank");
    } catch (err) {
      console.error("Error opening file", err);
      toast.error("⚠️ Failed to open report");
    }
  };

  return (
    <div className="view-reports">
      <div className="page-container">
        <h2>📑 Uploaded Reports</h2>

       {loading ? (
  <p>Loading patients...</p>
) : reports.length === 0 ? (
  <p>No patients added yet.</p>
) : (
          <ul className="report-list">
            {reports.map((report, index) => (
              <li key={index} className="report-item">
                <span className="report-name">{report.name}</span>
                <button
                  className="view-button"
                  onClick={() => viewFile(report.s3Key, report.contentType)}
                >
                  👁️ View
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="button-container">
          <button className="back-button" onClick={() => navigate('/dashboard')}>
            ⬅️ Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewReports;
