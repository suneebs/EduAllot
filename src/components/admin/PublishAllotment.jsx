import React, { useState, useEffect } from 'react';
import { db } from "../../utils/firebase";
import { collection, getDocs, doc, updateDoc, arrayUnion } from 'firebase/firestore';

const RunAllotment = () => {
  const [departments, setDepartments] = useState([]);
  const [students, setStudents] = useState([]);
  const [allotmentDone, setAllotmentDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch departments and students on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch departments
        const departmentsSnapshot = await getDocs(collection(db, "departments"));
        const departmentsData = departmentsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Fetch students (form_submissions)
        const studentsSnapshot = await getDocs(collection(db, "form_submissions"));
        const studentsData = studentsSnapshot.docs.map(doc => ({
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

  // Helper function to extract prioritized departments from priority choices map
  const getPriorityDepartments = (priorityChoices) => {
    if (!priorityChoices) return [];
    
    // Convert from map format {1: "DeptName1", 2: "DeptName2"} to ordered array
    return Object.entries(priorityChoices)
      .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
      .map(entry => entry[1]);
  };

  const runAllotment = () => {
    setLoading(true);
    setError(null);

    try {
      // Create a deep copy of departments to work with
      const deptsCopy = JSON.parse(JSON.stringify(departments));
      
      // Sort students by distance in descending order
      const sortedStudents = [...students].sort((a, b) => b.distance - a.distance);
      
      // Create a copy of students to track allocation
      const allocatedStudents = sortedStudents.map(student => ({
        ...student,
        allocated_department: null,
        seat_type: null
      }));

      // First pass: Allocate reserved seats based on category
      allocatedStudents.forEach(student => {
        // Skip if already allocated
        if (student.allocated_department) return;
        
        // Get priority departments as an array
        const priorityDepts = getPriorityDepartments(student.priorityChoices);
        
        // Try to allocate to a reserved seat in priority order
        for (const deptName of priorityDepts) {
          const deptIndex = deptsCopy.findIndex(d => d.name.toLowerCase() === deptName.toLowerCase());
          if (deptIndex === -1) continue;
          
          const dept = deptsCopy[deptIndex];
          
          // Check if there's a reserved seat for this category
          if (dept.reserved_seats && 
              dept.reserved_seats[student.category] && 
              dept.reserved_seats[student.category] > 0) {
            
            // Count how many seats of this category are already filled
            const filledSeats = (dept.allocated_seats || []).filter(
              seat => seat.seat_type === student.category
            ).length;
            
            if (filledSeats < dept.reserved_seats[student.category]) {
              // Allocate the student to this department with reserved seat
              student.allocated_department = dept.name;
              student.seat_type = student.category;
              
              // Add to department's allocated seats
              if (!dept.allocated_seats) dept.allocated_seats = [];
              dept.allocated_seats.push({
                student_id: student.formId,
                seat_type: student.category
              });
              
              break; // Stop looking for departments
            }
          }
        }
      });

      // Second pass: Allocate general seats to unallocated students
      allocatedStudents.forEach(student => {
        // Skip if already allocated
        if (student.allocated_department) return;
        
        // Get priority departments as an array
        const priorityDepts = getPriorityDepartments(student.priorityChoices);
        
        // Try to allocate to a general seat in priority order
        for (const deptName of priorityDepts) {
          const deptIndex = deptsCopy.findIndex(d => d.name.toLowerCase() === deptName.toLowerCase());
          if (deptIndex === -1) continue;
          
          const dept = deptsCopy[deptIndex];
          
          // Check if there are general seats available
          const totalAllocated = (dept.allocated_seats || []).length;
          const generalSeatsAllocated = (dept.allocated_seats || []).filter(
            seat => seat.seat_type === 'general'
          ).length;
          
          const generalSeatsCapacity = dept.reserved_seats?.general || 
            (dept.capacity - Object.values(dept.reserved_seats || {}).reduce((sum, val) => sum + val, 0));
          
          if (generalSeatsAllocated < generalSeatsCapacity && totalAllocated < dept.capacity) {
            // Allocate the student to this department with general seat
            student.allocated_department = dept.name;
            student.seat_type = 'general';
            
            // Add to department's allocated seats
            if (!dept.allocated_seats) dept.allocated_seats = [];
            dept.allocated_seats.push({
              student_id: student.formId,
              seat_type: 'general'
            });
            
            break; // Stop looking for departments
          }
        }
      });

      // Update departments with new allocations
      setDepartments(deptsCopy);
      // Update students with allocation info
      setStudents(allocatedStudents);
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
    if(prmp != "confirm") return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Update each department document in Firestore
      for (const dept of departments) {
        const deptRef = doc(db, "departments", dept.id);
        await updateDoc(deptRef, {
          allocated_seats: dept.allocated_seats || []
        });
      }
      
      // Update each student document with their allocation
      for (const student of students) {
        if (student.allocated_department) {
          const studentRef = doc(db, "form_submissions", student.id);
          await updateDoc(studentRef, {
            allocated_department: student.allocated_department,
            seat_type: student.seat_type
          });
        }
      }
      
      alert("Allotment published successfully!");
      setLoading(false);
    } catch (err) {
      setError("Failed to publish allotment: " + err.message);
      console.error("Error publishing allotment:", err);
      setLoading(false);
    }
  };
  const resetAllotments = async () => {
    setLoading(true);
    setError(null);
    var rst = prompt("Please type 'reset' to publish allotment");
    if(rst != "reset") return;
    try {
      
  
      
      // Clear local state
      const resetDepartments = departments.map(dept => ({
        ...dept,
        allocated_seats: []
      }));
  
      const resetStudents = students.map(student => ({
        ...student,
        allocated_department: null,
        seat_type: null
      }));
  
      setDepartments(resetDepartments);
      setStudents(resetStudents);
      setAllotmentDone(false);
      setLoading(false);
  
      alert("All allotments have been reset!");
    } catch (err) {
      setError("Failed to reset allotments: " + err.message);
      console.error("Error resetting allotments:", err);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 container" style={{ maxHeight: "580px", overflowY: "auto" }}>
      <h1 className="text-3xl font-bold mb-6">Run Allotment</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {!allotmentDone ? (
        <button 
          onClick={runAllotment}
          disabled={loading}
          className="btn btn-info"
        >
          {loading ? "Processing..." : "Run Allotment"}
        </button>
      ) : (
        <div className="mb-6">
          <button 
            onClick={publishAllotment}
            disabled={loading}
            className="btn btn-success  me-2"
          >
            {loading ? "Publishing..." : "Publish Allotment"}
          </button>
          
          <button 
             onClick={resetAllotments}
            disabled={loading}
            className="btn btn-danger"
          >
            Reset
          </button>
        </div>
      )}
      
      {allotmentDone && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {departments.map(dept => (
            <div key={dept.id} className="border rounded-lg p-4 shadow ">
              <h2 className="text-xl font-bold mb-2 capitalize">{dept.name} Department</h2>
              <p className="mb-2">Capacity: {dept.capacity}</p>
              <p className="mb-2">Allocated: {(dept.allocated_seats || []).length}</p>
              
              <h3 className="font-bold mt-4 mb-2">Allocated Students:</h3>
              {(dept.allocated_seats || []).length > 0 ? (
                <ul className="list-disc pl-5">
                  {dept.allocated_seats.map((seat, index) => {
                    const student = students.find(s => s.formId === seat.student_id);
                    return (
                      <li key={index} className="mb-1">
                        {student ? student.name : seat.student_id} ({seat.seat_type})
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-gray-500 italic">No students allocated</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RunAllotment;