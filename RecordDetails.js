// // src/components/Patients/RecordDetails.js
// import React, { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import { doc, getDoc } from "firebase/firestore";
// import { db } from "../../services/firebase";

// const RecordDetails = () => {
//   const { id } = useParams();
//   const [patient, setPatient] = useState(null);

//   useEffect(() => {
//     const fetchPatient = async () => {
//       const patientDoc = await getDoc(doc(db, "patients", id));
//       if (patientDoc.exists()) {
//         setPatient(patientDoc.data());
//       }
//     };
//     fetchPatient();
//   }, [id]);

//   if (!patient) return <div className="p-10">Loading...</div>;

//   return (
//     <div className="p-10 bg-yellow-50 min-h-screen">
//       <h2 className="text-2xl font-bold text-yellow-800 mb-4">Patient Details</h2>
//       <div className="bg-white p-6 rounded shadow space-y-3">
//         <p><strong>Name:</strong> {patient.name}</p>
//         <p><strong>Age:</strong> {patient.age}</p>
//         <p><strong>Diagnosis:</strong> {patient.diagnosis}</p>
//         <p><strong>Vitals:</strong> {patient.vitals}</p>
//         <p><strong>Created:</strong> {patient.createdAt?.toDate().toLocaleString()}</p>
//       </div>
//     </div>
//   );
// };

// export default RecordDetails;