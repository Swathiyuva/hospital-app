// src/components/Upload/ViewReports.js
import React, { useEffect, useState } from "react";
import "../../style.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  ScanCommand,
  UpdateItemCommand,
  DeleteItemCommand,
} from "@aws-sdk/client-dynamodb";
import { ddbClient, s3Client } from "../../aws-config";
import { GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

const BUCKET_NAME = "shrs-health-reports"; // ✅ your S3 bucket name
const TABLE_NAME = "Reports"; // ✅ DynamoDB table name

const ViewReports = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");

  const handleBack = () => navigate("/dashboard");

  // 📌 Fetch reports from DynamoDB
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const data = await ddbClient.send(new ScanCommand({ TableName: TABLE_NAME }));

        const formatted = data.Items.map((item) => ({
          reportId: item.reportId.S,
          patientId: item.patientId.S,
          name: item.name.S,
          description: item.description?.S || "",
          s3Key: item.s3Key.S,
          contentType: item.contentType.S,
          uploadedAt: item.uploadedAt.S,
          status: item.status?.S || "Pending",
          editing: false,
        }));

        setReports(formatted);
        setFilteredReports(formatted);
      } catch (error) {
        console.error("Failed to fetch reports:", error);
        toast.error("⚠️ Failed to load reports");
      }
    };

    fetchReports();
  }, []);

  // 📌 Apply filters + sorting
  useEffect(() => {
    let result = [...reports];

    if (filterType) {
      result = result.filter((r) => r.contentType.includes(filterType));
    }

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(
        (r) =>
          r.name.toLowerCase().includes(lower) ||
          r.description.toLowerCase().includes(lower)
      );
    }

    result.sort((a, b) =>
      sortOrder === "newest"
        ? new Date(b.uploadedAt) - new Date(a.uploadedAt)
        : new Date(a.uploadedAt) - new Date(b.uploadedAt)
    );

    setFilteredReports(result);
  }, [searchTerm, filterType, sortOrder, reports]);

  // 📌 Download from S3 directly (Blob)
  const handleDownload = async (s3Key) => {
    try {
      const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: s3Key,
      });
      const response = await s3Client.send(command);

      // Convert stream → blob
      const blob = await response.Body.transformToByteArray();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.download = s3Key.split("/").pop();
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success("✅ Download started");
    } catch (err) {
      console.error("Download error:", err);
      toast.error("❌ Download failed.");
    }
  };

  // 📌 Delete from S3 + DynamoDB
  const deleteReport = async (report) => {
    try {
      // 1️⃣ Delete from S3
      await s3Client.send(
        new DeleteObjectCommand({
          Bucket: BUCKET_NAME,
          Key: report.s3Key,
        })
      );

      // 2️⃣ Delete from DynamoDB
      await ddbClient.send(
        new DeleteItemCommand({
          TableName: TABLE_NAME,
          Key: {
            reportId: { S: report.reportId },
            patientId: { S: report.patientId },
          },
        })
      );

      // 3️⃣ Update frontend state
      setReports((prevReports) =>
        prevReports.filter((r) => r.reportId !== report.reportId)
      );
      setFilteredReports((prevReports) =>
        prevReports.filter((r) => r.reportId !== report.reportId)
      );

      toast.success("🗑️ Report deleted successfully from S3 + DynamoDB");
    } catch (error) {
      console.error("Error deleting report:", error);
      toast.error("❌ Failed to delete report");
    }
  };

  // 📌 View file directly (public URL)
  const handleView = (key) => {
    const url = `https://${BUCKET_NAME}.s3.us-east-1.amazonaws.com/${key}`;
    window.open(url, "_blank");
  };

  // 📌 Toggle edit mode
  const toggleEdit = (index, value) => {
    const updated = [...filteredReports];
    updated[index].editing = value;
    setFilteredReports(updated);
  };

  // 📌 Save updated description + status
  const handleSave = async (report, index) => {
    try {
      await ddbClient.send(
        new UpdateItemCommand({
          TableName: TABLE_NAME,
          Key: {
            reportId: { S: report.reportId },
            patientId: { S: report.patientId },
          },
          UpdateExpression: "SET description = :d, #st = :s",
          ExpressionAttributeNames: { "#st": "status" },
          ExpressionAttributeValues: {
            ":d": { S: report.description || "" },
            ":s": { S: report.status || "Pending" },
          },
        })
      );

      toast.success("✅ Report updated successfully");
      toggleEdit(index, false);
    } catch (err) {
      console.error("Error updating report:", err);
      toast.error("❌ Failed to update report");
    }
  };

  return (
    <div className="view-reports">
      <div className="page-container">
        <h2>📑 Uploaded Reports</h2>

        {/* 🔍 Filters */}
        <div className="filter-bar">
          <input
            type="text"
            placeholder="Search by name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="">All Types</option>
            <option value="pdf">PDF</option>
            <option value="jpeg">JPEG</option>
            <option value="png">PNG</option>
          </select>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="newest">📤 Newest</option>
            <option value="oldest">📥 Oldest</option>
          </select>
        </div>

        <div className="reports-list">
          {filteredReports.map((r, index) => (
            <div key={r.reportId} className="report-card">
              {/* Left info */}
              <div className="report-info">
                <h3 className="report-title">{r.name}</h3>

                {r.editing ? (
                  <>
                    <textarea
                      value={r.description}
                      onChange={(e) => {
                        const updated = [...filteredReports];
                        updated[index].description = e.target.value;
                        setFilteredReports(updated);
                      }}
                    />
                    <select
                      value={r.status || "Pending"}
                      onChange={(e) => {
                        const updated = [...filteredReports];
                        updated[index].status = e.target.value;
                        setFilteredReports(updated);
                      }}
                    >
                      <option>Pending</option>
                      <option>Reviewed</option>
                    </select>
                  </>
                ) : (
                  <>
                    <p className="report-desc">
                      {r.description || "No description"}
                    </p>
                    <p className="report-status">
                      Status:{" "}
                      <span
                        className={
                          r.status === "Reviewed"
                            ? "status-reviewed"
                            : "status-pending"
                        }
                      >
                        {r.status || "Pending"}
                      </span>
                    </p>
                    <p className="report-date">
                      🕒 {new Date(r.uploadedAt).toLocaleString()}
                    </p>
                  </>
                )}
              </div>

              {/* Right actions */}
              <div className="report-actions">
                {r.editing ? (
                  <>
                    <button onClick={() => handleSave(r, index)}>💾 Save</button>
                    <button onClick={() => toggleEdit(index, false)}>❌ Cancel</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => handleView(r.s3Key)}>👁️ View</button>
                    <button onClick={() => handleDownload(r.s3Key)}>⬇️ Download</button>
                    <button onClick={() => deleteReport(r)}>🗑️ Delete</button>
                    <button onClick={() => toggleEdit(index, true)}>✏️ Edit</button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="button-container">
          <button className="back-button" onClick={handleBack}>
            ⬅️ Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewReports;
