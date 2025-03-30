import React, { useState, useEffect } from "react";
import { db } from "../../utils/firebase";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import AllotmentResults from "./AllotmentResults";

const PublishAllotment = () => {
  const [departments, setDepartments] = useState([]);
  const [students, setStudents] = useState([]);
  const [allotmentDone, setAllotmentDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showResults, setShowResults] = useState(false); // Toggle Results

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [departmentsSnapshot, studentsSnapshot] = await Promise.all([
          getDocs(collection(db, "departments")),
          getDocs(collection(db, "form_submissions"))
        ]);

        const departmentsData = departmentsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          allocated_seats: doc.data().allocated_seats || []
        }));

        const studentsData = studentsSnapshot.docs.map((doc) => ({
          id: doc.id,
          formId: doc.data().formId,
          ...doc.data(),
          allocated_department: null
        }));

        setDepartments(departmentsData);
        setStudents(studentsData);
      } catch (err) {
        setError("Failed to fetch data: " + err.message);
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
  }, []);

  const getPriorityDepartments = (priorityChoices) => {
    if (!priorityChoices) return [];
    return Object.entries(priorityChoices)
      .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
      .map((entry) => entry[1]);
  };

  const allocateSeats = (students, departments, category, general = false) => {
    students.forEach((student) => {
      if (student.allocated_department) return;
      const priorityDepts = getPriorityDepartments(student.priorityChoices);

      for (const deptName of priorityDepts) {
        const dept = departments.find((d) => d.name.toLowerCase() === deptName.toLowerCase());
        if (!dept) continue;

        const allocatedSeats = dept.allocated_seats.filter((s) => s.seat_type === category).length;
        const availableSeats = dept.reserved_seats?.[category] || 0;
        const totalAllocated = dept.allocated_seats.length;

        if (general) {
          const generalSeatsAvailable =
            dept.reserved_seats?.general ||
            dept.capacity - Object.values(dept.reserved_seats || {}).reduce((sum, val) => sum + val, 0);

          if (totalAllocated < dept.capacity && allocatedSeats < generalSeatsAvailable) {
            student.allocated_department = dept.name;
            student.seat_type = "general";
            dept.allocated_seats.push({ student_id: student.formId, seat_type: "general" });
            break;
          }
        } else {
          if (allocatedSeats < availableSeats) {
            student.allocated_department = dept.name;
            student.seat_type = category;
            dept.allocated_seats.push({ student_id: student.formId, seat_type: category });
            break;
          }
        }
      }
    });
  };

  const runAllotment = () => {
    setLoading(true);
    setError(null);
  
    try {
      const deptsCopy = JSON.parse(JSON.stringify(departments));
      
      // **Filter out students whose distance is greater than 70 km**
      const eligibleStudents = students.filter(student => student.distance <= 70);
      
      const sortedStudents = [...eligibleStudents].sort((a, b) => b.distance - a.distance);
  
      // **1. Physically Disabled (PD) - 5% Reserved**
      allocateSeats(sortedStudents.filter(s => s.category === "PD"), deptsCopy, "PD");
  
      // **2. Transgender (1 seat reserved)**
      allocateSeats(sortedStudents.filter(s => s.category === "Transgender"), deptsCopy, "Transgender");
  
      // **3. Special Reservations**
      allocateSeats(sortedStudents.filter(s => s.category === "Sports"), deptsCopy, "Sports");
      allocateSeats(sortedStudents.filter(s => s.category === "Technical Staff"), deptsCopy, "Technical Staff");
      allocateSeats(sortedStudents.filter(s => s.category === "Central Govt"), deptsCopy, "Central Govt");
  
      // **4. Mandatory Reservations (SC, ST, SEBC, EWS)**
      const reservationCategories = ["SC", "ST", "EZ", "M", "BH", "LC", "DV", "VK", "KN", "BX", "KU", "EWS"];
      reservationCategories.forEach(category => {
        allocateSeats(sortedStudents.filter(s => s.category === category), deptsCopy, category);
      });
  
      // **5. General Merit Allocation**
      allocateSeats(sortedStudents, deptsCopy, "general", true);
  
      setDepartments(deptsCopy);
      setStudents(sortedStudents);
      setAllotmentDone(true);
      setLoading(false);
    } catch (err) {
      setError("Failed to run allotment: " + err.message);
      console.error("Error running allotment:", err);
      setLoading(false);
    }
  };
  

  const publishAllotment = async () => {
    if (!allotmentDone) return;
    var prmp = prompt("Please type 'confirm' to publish allotment");
    if (prmp !== "confirm") return;

    setLoading(true);
    setError(null);

    try {
      const auth = getAuth();
      if (!auth.currentUser) {
        throw new Error("User is not authenticated. Please log in.");
      }

      const timestamp = new Date().toISOString();
      const allotmentRef = collection(db, "published_allotments");

      await addDoc(allotmentRef, {
        timestamp,
        departments: departments.map((dept) => ({
          id: dept.id,
          name: dept.name,
          capacity: dept.capacity,
          allocated_seats: dept.allocated_seats || []
        })),
        students: students.map((student) => ({
          id: student.id,
          name: student.name,
          formId: student.formId,
          category: student.category,
          allocated_department: student.allocated_department,
          seat_type: student.seat_type
        }))
      });

      alert("Allotment published successfully!");
      setLoading(false);
    } catch (err) {
      console.error("Error publishing allotment:", err);
      setError("Failed to publish allotment: " + err.message);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 container" style={{ maxHeight: "580px", overflowY: "auto" }}>
      <h1 className="text-3xl font-bold mb-6">Publish Allotment</h1>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      {!allotmentDone ? (
        <button onClick={runAllotment} disabled={loading} className="btn btn-info">
          {loading ? "Processing..." : "Run Allotment"}
        </button>
      ) : (
        <div className="mb-6">
          <button onClick={publishAllotment} disabled={loading} className="btn btn-success me-2">
            {loading ? "Publishing..." : "Publish Allotment"}
          </button>
          <button onClick={() => setShowResults(!showResults)} className="btn btn-primary me-2">
            {showResults ? "Hide Results" : "Show Allotment Results"}
          </button>
        </div>
      )}

{showResults && <AllotmentResults onClose={() => setShowResults(false)} />}

    </div>
  );
};

export default PublishAllotment;
