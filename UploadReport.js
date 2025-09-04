import React, { useState } from "react";
import "../../style.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { PutItemCommand } from "@aws-sdk/client-dynamodb";
import { ddbClient } from "../../aws-config";
import { v4 as uuidv4 } from "uuid";

const UploadReport = () => {
  const navigate = useNavigate();
  const handleBack = () => navigate("/dashboard");

  const [selectedFile, setSelectedFile] = useState(null);
  const [description, setDescription] = useState("");
  const [patientId, setPatientId] = useState("");
  const [title, setTitle] = useState("");
  const [reportType, setReportType] = useState("");
  const [doctor, setDoctor] = useState("");
  const [reportDate, setReportDate] = useState("");
  const [tags, setTags] = useState("");

  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileChange = (e) => setSelectedFile(e.target.files[0]);
  const handleDrop = (e) => {
    e.preventDefault();
    setSelectedFile(e.dataTransfer.files[0]);
  };
  const handleDragOver = (e) => e.preventDefault();

  const handleUpload = async () => {
    if (!selectedFile || !patientId) {
      toast.error("❌ Please select a file and enter Patient ID.");
      return;
    }

    setUploading(true);
    setProgress(30);

    const reportId = uuidv4();
    const fileName = `${reportId}_${selectedFile.name}`;
    const uploadedAt = new Date().toISOString();
    const bucketName = "shrs-health-reports";
    const region = "us-east-1";
    const s3Url = `https://${bucketName}.s3.${region}.amazonaws.com/${fileName}`;

    try {
      // ✅ Upload to S3
      const res = await fetch(s3Url, {
        method: "PUT",
        headers: { "Content-Type": selectedFile.type },
        body: selectedFile,
      });

      setProgress(70);

      if (!res.ok) throw new Error(`S3 upload failed with status: ${res.status}`);

      // ✅ Save metadata to DynamoDB
      await ddbClient.send(
        new PutItemCommand({
          TableName: "Reports",
          Item: {
            patientId: { S: patientId },
            reportId: { S: reportId },
            title: { S: title || "Untitled Report" },
            reportType: { S: reportType || "Other" },
            doctor: { S: doctor || "Unknown" },
            reportDate: { S: reportDate || new Date().toISOString().split("T")[0] },
            tags: { S: tags || "" },
            description: { S: description || "No description" },
            name: { S: selectedFile.name },
            s3Key: { S: fileName },
            uploadedAt: { S: uploadedAt },
            contentType: { S: selectedFile.type },
          },
        })
      );

      setProgress(100);
      toast.success("✅ Report uploaded successfully!");

      // Reset form
      setSelectedFile(null);
      setDescription("");
      setPatientId("");
      setTitle("");
      setReportType("");
      setDoctor("");
      setReportDate("");
      setTags("");
      document.getElementById("file-input").value = "";
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("❌ Upload failed. Check console.");
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 1500); // reset after success
    }
  };

  return (
    <div className="upload-report">
      <h2 className="section-title">📤 Upload Health Report</h2>

      {/* Upload Box */}
      <div
        className="upload-box"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <input
          id="file-input"
          type="file"
          onChange={handleFileChange}
          accept=".pdf,.jpg,.jpeg,.png"
          hidden
        />
        <label htmlFor="file-input" className="file-label">
          {selectedFile ? (
            <p>📄 {selectedFile.name}</p>
          ) : (
            <p>Drag & Drop file here or <span className="browse">browse</span></p>
          )}
        </label>
      </div>

      {/* Extra Inputs */}
      <input
        type="text"
        placeholder="📑 Report Title..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <select
        value={reportType}
        onChange={(e) => setReportType(e.target.value)}
      >
        <option value="">-- Select Report Type --</option>
        <option value="Lab Report">Lab Report</option>
        <option value="Prescription">Prescription</option>
        <option value="Scan">Scan</option>
        <option value="Invoice">Invoice</option>
        <option value="Other">Other</option>
      </select>

      <input
        type="text"
        placeholder="👨‍⚕️ Doctor / Issued By..."
        value={doctor}
        onChange={(e) => setDoctor(e.target.value)}
      />

      <input
        type="date"
        value={reportDate}
        onChange={(e) => setReportDate(e.target.value)}
      />

      <input
        type="text"
        placeholder="🏷️ Tags (comma separated)..."
        value={tags}
        onChange={(e) => setTags(e.target.value)}
      />

      <input
        type="text"
        placeholder="📝 Enter description..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <input
        type="text"
        placeholder="🆔 Enter Patient ID..."
        value={patientId}
        onChange={(e) => setPatientId(e.target.value)}
      />

      {/* Upload Progress */}
      {uploading && (
        <div className="progress-bar">
          <div className="progress" style={{ width: `${progress}%` }}></div>
        </div>
      )}

      {/* Buttons */}
      <div className="button-container">
  <button type="submit" className="upload-button">
    ⬆️ Upload Report
  </button>
  <button type="button" className="back-button" onClick={handleBack}>
    ⬅️ Back to Dashboard
  </button>
</div>

    </div>
  );
};

export default UploadReport;
