import React from 'react';
import '../../style.css';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const ViewReports = () => {
  const navigate = useNavigate();
  const handleBack = () => navigate('/dashboard');

  const reports = JSON.parse(localStorage.getItem('uploadedReports')) || [];

  const b64toBlob = (b64Data, contentType = '', sliceSize = 512) => {
    const byteCharacters = atob(b64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    return new Blob(byteArrays, { type: contentType });
  };

  const viewFile = (fileData, type) => {
    if (!fileData || !type) {
      toast.error('⚠️ Report is incomplete');
      return;
    }

    toast.success('👁️ Opening file...');
    const base64 = fileData.split(',')[1];
    const blob = b64toBlob(base64, type);
    const blobUrl = URL.createObjectURL(blob);
    window.open(blobUrl, '_blank');
  };

  return (
    <div className="view-reports">
      <div className="page-container">
        <h2>📑 Uploaded Reports</h2>

        {reports.length === 0 ? (
          <p>No reports uploaded yet.</p>
        ) : (
          <ul className="report-list">
            {reports.map((report, index) => (
              <li key={index} className="report-item">
                <span className="report-name">{report.name}</span>
                <button className="view-button" onClick={() => viewFile(report.data, report.type)}>
                  👁️ View
                </button>
              </li>
            ))}
          </ul>
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

export default ViewReports;