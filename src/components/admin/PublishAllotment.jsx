import React, { useState, useEffect } from "react";
import { db } from "../../utils/firebase";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const PublishAllotment = () => {
  const [departments, setDepartments] = useState([]);
  const [students, setStudents] = useState([]);
  const [allotmentDone, setAllotmentDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch departments and students
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

  // Function to extract priority departments
  const getPriorityDepartments = (priorityChoices) => {
    if (!priorityChoices) return [];

    return Object.entries(priorityChoices)
      .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
      .map((entry) => entry[1]);
  };

  // Run the allotment algorithm
  const runAllotment = () => {
    setLoading(true);
    setError(null);

    try {
      const deptsCopy = JSON.parse(JSON.stringify(departments));
      const sortedStudents = [...students].sort((a, b) => b.distance - a.distance);

      // Allocate Reserved Seats
      sortedStudents.forEach((student) => {
        if (student.allocated_department) return;
        const priorityDepts = getPriorityDepartments(student.priorityChoices);

        for (const deptName of priorityDepts) {
          const dept = deptsCopy.find((d) => d.name.toLowerCase() === deptName.toLowerCase());
          if (!dept) continue;

          if (dept.reserved_seats?.[student.category] > 0) {
            const allocatedSeats = dept.allocated_seats.filter((s) => s.seat_type === student.category).length;

            if (allocatedSeats < dept.reserved_seats[student.category]) {
              student.allocated_department = dept.name;
              student.seat_type = student.category;
              dept.allocated_seats.push({ student_id: student.formId, seat_type: student.category });
              break;
            }
          }
        }
      });

      // Allocate General Seats
      sortedStudents.forEach((student) => {
        if (student.allocated_department) return;
        const priorityDepts = getPriorityDepartments(student.priorityChoices);

        for (const deptName of priorityDepts) {
          const dept = deptsCopy.find((d) => d.name.toLowerCase() === deptName.toLowerCase());
          if (!dept) continue;

          const totalAllocated = dept.allocated_seats.length;
          const generalSeatsAllocated = dept.allocated_seats.filter((s) => s.seat_type === "general").length;
          const generalSeatsCapacity =
            dept.reserved_seats?.general ||
            dept.capacity - Object.values(dept.reserved_seats || {}).reduce((sum, val) => sum + val, 0);

          if (generalSeatsAllocated < generalSeatsCapacity && totalAllocated < dept.capacity) {
            student.allocated_department = dept.name;
            student.seat_type = "general";
            dept.allocated_seats.push({ student_id: student.formId, seat_type: "general" });
            break;
          }
        }
      });

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

  // Publish allotment to db
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

  // Reset all allotments
  const resetAllotments = () => {
    if (prompt("Please type 'reset' to reset allotments") !== "reset") return;

    setLoading(true);
    setError(null);

    setDepartments(departments.map((dept) => ({ ...dept, allocated_seats: [] })));
    setStudents(students.map((student) => ({ ...student, allocated_department: null, seat_type: null })));
    setAllotmentDone(false);
    setLoading(false);

    alert("All allotments have been reset!");
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
          <button onClick={resetAllotments} disabled={loading} className="btn btn-danger">
            Reset
          </button>
        </div>
      )}
    </div>
  );
};

export default PublishAllotment;
