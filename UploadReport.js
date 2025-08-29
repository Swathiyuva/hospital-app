import React, { useState } from 'react';
import '../../style.css';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { PutItemCommand } from "@aws-sdk/client-dynamodb";
import { ddbClient } from "../../aws-config"; // 👈 No need for s3Client
import { v4 as uuidv4 } from "uuid";

const UploadReport = () => {
  const navigate = useNavigate();
  const handleBack = () => navigate('/dashboard');

  const [selectedFile, setSelectedFile] = useState(null);
  const [description, setDescription] = useState('');
  const [patientId, setPatientId] = useState(''); // ✅ Added state for patientId

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile || !patientId) {
      toast.error("❌ Please select a file and enter Patient ID.");
      return;
    }

    const reportId = uuidv4();
    const fileName = `${reportId}_${selectedFile.name}`;
    const uploadedAt = new Date().toISOString();
    const bucketName = "shrs-health-reports";
    const region = "us-east-1";
    const s3Url = `https://${bucketName}.s3.${region}.amazonaws.com/${fileName}`;

    try {
      // ✅ Upload to S3 using fetch
      const res = await fetch(s3Url, {
        method: "PUT",
        headers: {
          "Content-Type": selectedFile.type,
        },
        body: selectedFile,
      });

      if (!res.ok) {
        throw new Error(`S3 upload failed with status: ${res.status}`);
      }

      // ✅ Save metadata to DynamoDB
      await ddbClient.send(
        new PutItemCommand({
          TableName: "Reports",
          Item: {
            patientId: { S: patientId }, // ✅ Required field
            reportId: { S: reportId },
            name: { S: selectedFile.name },
            s3Key: { S: fileName },
            uploadedAt: { S: uploadedAt },
            description: { S: description || "No description" },
            contentType: { S: selectedFile.type },
          },
        })
      );

      toast.success("✅ Report uploaded successfully!");
      setSelectedFile(null);
      setDescription('');
      setPatientId('');
      document.getElementById('file-input').value = '';
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("❌ Upload failed. Check console.");
    }
  };

  return (
    <div className="upload-report">
      <h2 className="section-title">📤 Upload Health Report</h2>

      <div className="upload-form">
        <input
          id="file-input"
          type="file"
          onChange={handleFileChange}
          accept=".pdf,.jpg,.jpeg,.png"
        />
        <input
          type="text"
          placeholder="Enter description..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          type="text"
          placeholder="Enter Patient ID..."
          value={patientId}
          onChange={(e) => setPatientId(e.target.value)}
        />
        <button className="upload-btn" onClick={handleUpload} disabled={!selectedFile}>
          Upload
        </button>
      </div>

      <div className="button-container">
        <button className="back-button" onClick={handleBack}>
          ⬅️ Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default UploadReport;