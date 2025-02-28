import React, { useState, useEffect } from "react";
import { db } from "../../utils/firebase";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";

function AdminAllotment() {
  const [departments, setDepartments] = useState({});
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDepartments();
    fetchSubmissions();
  }, []);

  // Fetch department data
  const fetchDepartments = async () => {
    try {
      const deptSnapshot = await getDocs(collection(db, "departments"));
      const deptData = {};
      deptSnapshot.forEach((doc) => {
        deptData[doc.id] = { ...doc.data(), general: [], reserved: {} };
      });
      setDepartments(deptData);
    } catch (error) {
      console.error("Error fetching departments: ", error);
    }
  };

  // Fetch student submissions
  const fetchSubmissions = async () => {
    try {
      const submissionSnapshot = await getDocs(collection(db, "form_submissions"));
      const submissionData = submissionSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setSubmissions(submissionData);
    } catch (error) {
      console.error("Error fetching submissions: ", error);
    }
  };

  // Allot students to departments
  const allotStudents = async () => {
    setLoading(true);
    const updatedDepartments = JSON.parse(JSON.stringify(departments));

    const sortedSubmissions = submissions.sort((a, b) => a.distance - b.distance);

    for (const student of sortedSubmissions) {
      const { priorityChoices, caste, distance, name } = student;
      let allotted = false;

      // General seat allocation
      for (const priority of Object.values(priorityChoices)) {
        const dept = updatedDepartments[priority];
        if (dept && dept.general.length < dept.totalSeats - 3) {
          dept.general.push({ name, caste, distance });
          allotted = true;
          break;
        }
      }

      // Reserved seat allocation
      if (!allotted) {
        for (const priority of Object.values(priorityChoices)) {
          const dept = updatedDepartments[priority];
          if (dept && caste in dept.reserved && dept.reserved[caste] < dept[caste]) {
            dept.reserved[caste] = (dept.reserved[caste] || []).concat({ name, distance });
            allotted = true;
            break;
          }
        }
      }
    }

    // Update Firebase
    try {
      for (const [deptId, data] of Object.entries(updatedDepartments)) {
        await updateDoc(doc(db, "departments", deptId), data);
      }
      setDepartments(updatedDepartments);
    } catch (error) {
      console.error("Error updating departments: ", error);
    }

    setLoading(false);
  };

  return (
    <div className="container">
      <h2>Admin Allotment Panel</h2>
      <button onClick={allotStudents} className="btn btn-primary" disabled={loading}>
        {loading ? "Processing..." : "Run Allotment"}
      </button>

      <div className="mt-4">
        {Object.entries(departments).map(([dept, data]) => (
          <div key={dept} className="border p-3 mb-3">
            <h3>{dept} Department</h3>
            <h4>General</h4>
            <ul>
              {data.general.map((student, index) => (
                <li key={index}>{student.name} - {student.distance} km</li>
              ))}
            </ul>

            <h4>Reserved</h4>
            {Object.entries(data.reserved).map(([caste, students]) => (
              <div key={caste}>
                <p>{caste}:</p>
                <ul>
                  {students ? students.map((student, index) => (
                    <li key={index}>{student.name} - {student.distance} km</li>
                  )) : "Vacant"}
                </ul>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminAllotment;
