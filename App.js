// src/App.js
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './style.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// Components
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import Dashboard from "./components/Dashboard/Dashboard";
import PatientForm from "./components/Patients/PatientForm";
import PatientList from "./components/Patients/PatientList";
import UploadReport from "./components/Upload/UploadReport";
import ViewReports from './components/Upload/ViewReports';
import RecordDetails from "./components/Patients/RecordDetails";

function App() {
  return (
    <Router>
      <Routes>
        
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/add-patient" element={<PatientForm />} />
        <Route path="/patient-list" element={<PatientList />} />
        <Route path="/upload-report" element={<UploadReport />} />
        <Route path="/view-reports" element={<ViewReports />} />
        <Route path="/record/:id" element={<RecordDetails />} />
      </Routes>
      <ToastContainer position="top-right" autoClose={3000} pauseOnHover />
    </Router>
    
  );
}

export default App;
