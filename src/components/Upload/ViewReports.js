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

const BUCKET_NAME = "shrs-health-reports";
const TABLE_NAME = "Reports";

const ViewReports = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");

  const handleBack = () => navigate("/dashboard");

  // 📌 Fetch reports
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
          title: item.title?.S || "Untitled",
          reportType: item.reportType?.S || "Other",
          doctor: item.doctor?.S || "Unknown",
          reportDate: item.reportDate?.S || "",
          tags: item.tags?.S || "",
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
      result = result.filter((r) =>
        r.reportType.toLowerCase().includes(filterType.toLowerCase())
      );
    }

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(
        (r) =>
          r.name.toLowerCase().includes(lower) ||
          r.description.toLowerCase().includes(lower) ||
          r.title.toLowerCase().includes(lower) ||
          r.doctor.toLowerCase().includes(lower) ||
          r.tags.toLowerCase().includes(lower)
      );
    }

    result.sort((a, b) =>
      sortOrder === "newest"
        ? new Date(b.uploadedAt) - new Date(a.uploadedAt)
        : new Date(a.uploadedAt) - new Date(b.uploadedAt)
    );

    setFilteredReports(result);
  }, [searchTerm, filterType, sortOrder, reports]);

  // 📌 Download
  const handleDownload = async (s3Key) => {
    try {
      const command = new GetObjectCommand({ Bucket: BUCKET_NAME, Key: s3Key });
      const response = await s3Client.send(command);
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

  // 📌 Delete
  const deleteReport = async (report) => {
    try {
      await s3Client.send(new DeleteObjectCommand({ Bucket: BUCKET_NAME, Key: report.s3Key }));
      await ddbClient.send(
        new DeleteItemCommand({
          TableName: TABLE_NAME,
          Key: { reportId: { S: report.reportId }, patientId: { S: report.patientId } },
        })
      );

      setReports((prev) => prev.filter((r) => r.reportId !== report.reportId));
      setFilteredReports((prev) => prev.filter((r) => r.reportId !== report.reportId));

      toast.success("🗑️ Report deleted successfully");
    } catch (error) {
      console.error("Error deleting report:", error);
      toast.error("❌ Failed to delete report");
    }
  };

  // 📌 View
  const handleView = (key) => {
    const url = `https://${BUCKET_NAME}.s3.us-east-1.amazonaws.com/${key}`;
    window.open(url, "_blank");
  };

  // 📌 Toggle edit
  const toggleEdit = (index, value) => {
    const updated = [...filteredReports];
    updated[index].editing = value;
    setFilteredReports(updated);
  };

  // 📌 Save edits
  const handleSave = async (report, index) => {
    try {
      await ddbClient.send(
        new UpdateItemCommand({
          TableName: TABLE_NAME,
          Key: { reportId: { S: report.reportId }, patientId: { S: report.patientId } },
          UpdateExpression:
            "SET description = :d, #st = :s, title = :t, reportType = :rt, doctor = :doc, reportDate = :rd, tags = :tg",
          ExpressionAttributeNames: { "#st": "status" },
          ExpressionAttributeValues: {
            ":d": { S: report.description || "" },
            ":s": { S: report.status || "Pending" },
            ":t": { S: report.title || "Untitled" },
            ":rt": { S: report.reportType || "Other" },
            ":doc": { S: report.doctor || "Unknown" },
            ":rd": { S: report.reportDate || "" },
            ":tg": { S: report.tags || "" },
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
    <div className="view-reports page-container">
      <h2 className="page-title">📑 Uploaded Reports</h2>

      {/* 🔍 Filters */}
      <div className="filter-bar">
        <input
          type="text"
          placeholder="🔎 Search by title, doctor, tags..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
          <option value="">All Types</option>
          <option value="Lab Report">Lab Report</option>
          <option value="Prescription">Prescription</option>
          <option value="Scan">Scan</option>
          <option value="Invoice">Invoice</option>
          <option value="Other">Other</option>
        </select>
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="newest">📤 Newest</option>
          <option value="oldest">📥 Oldest</option>
        </select>
      </div>

      {/* Reports List */}
      <div className="reports-list">
        {filteredReports.map((r, index) => (
          <div key={r.reportId} className="report-card">
            {/* Info */}
            <div className="report-info">
              {r.editing ? (
                <>
                  <input
                    type="text"
                    value={r.title}
                    onChange={(e) => {
                      const updated = [...filteredReports];
                      updated[index].title = e.target.value;
                      setFilteredReports(updated);
                    }}
                    placeholder="Title"
                  />
                  <input
                    type="text"
                    value={r.doctor}
                    onChange={(e) => {
                      const updated = [...filteredReports];
                      updated[index].doctor = e.target.value;
                      setFilteredReports(updated);
                    }}
                    placeholder="Doctor"
                  />
                  <input
                    type="date"
                    value={r.reportDate}
                    onChange={(e) => {
                      const updated = [...filteredReports];
                      updated[index].reportDate = e.target.value;
                      setFilteredReports(updated);
                    }}
                  />
                  <select
                    value={r.reportType}
                    onChange={(e) => {
                      const updated = [...filteredReports];
                      updated[index].reportType = e.target.value;
                      setFilteredReports(updated);
                    }}
                  >
                    <option>Lab Report</option>
                    <option>Prescription</option>
                    <option>Scan</option>
                    <option>Invoice</option>
                    <option>Other</option>
                  </select>
                  <input
                    type="text"
                    value={r.tags}
                    onChange={(e) => {
                      const updated = [...filteredReports];
                      updated[index].tags = e.target.value;
                      setFilteredReports(updated);
                    }}
                    placeholder="Tags (comma separated)"
                  />
                  <textarea
                    value={r.description}
                    onChange={(e) => {
                      const updated = [...filteredReports];
                      updated[index].description = e.target.value;
                      setFilteredReports(updated);
                    }}
                    placeholder="Description"
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
                  <h3 className="report-title">{r.title}</h3>
                  <p><b>Type:</b> {r.reportType}</p>
                  <p><b>Doctor:</b> {r.doctor}</p>
                  <p><b>Date:</b> {r.reportDate}</p>
                  <p><b>Tags:</b> {r.tags}</p>
                  <p><b>File:</b> {r.name}</p>
                  <p><b>Description:</b> {r.description || "No description"}</p>
                  <p className="report-status">
                    Status:{" "}
                    <span
                      className={
                        r.status === "Reviewed" ? "status-reviewed" : "status-pending"
                      }
                    >
                      {r.status || "Pending"}
                    </span>
                  </p>
                  <p className="report-date">🕒 {new Date(r.uploadedAt).toLocaleString()}</p>
                </>
              )}
            </div>

            {/* Actions */}
            <div className="report-actions">
              {r.editing ? (
                <>
                  <button className="btn-save" onClick={() => handleSave(r, index)}>💾 Save</button>
                  <button className="btn-cancel" onClick={() => toggleEdit(index, false)}>❌ Cancel</button>
                </>
              ) : (
                <>
                  <button className="btn-view" onClick={() => handleView(r.s3Key)}>👁️ View</button>
                  <button className="btn-download" onClick={() => handleDownload(r.s3Key)}>⬇️ Download</button>
                  <button className="btn-delete" onClick={() => deleteReport(r)}>🗑️ Delete</button>
                  <button className="btn-edit" onClick={() => toggleEdit(index, true)}>✏️ Edit</button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Back Button */}
      <div className="button-container">
        <button className="back-button" onClick={handleBack}>
          ⬅️ Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default ViewReports;
