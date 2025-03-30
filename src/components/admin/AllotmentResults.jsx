import React, { useState, useEffect } from "react";
import { db } from "../../utils/firebase";
import { collection, getDocs } from "firebase/firestore";

const AllotmentResults = () => {
  const [allotments, setAllotments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAllotments = async () => {
      setLoading(true);
      try {
        const snapshot = await getDocs(collection(db, "published_allotments"));
        const allotmentData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        
        // Sort allotments by latest first
        allotmentData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        setAllotments(allotmentData);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch allotments: " + err.message);
        console.error("Error fetching allotments:", err);
        setLoading(false);
      }
    };

    fetchAllotments();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6 container">
      <h1 className="text-3xl font-bold mb-6">Previous Allotments</h1>

      {loading && <p>Loading allotments...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {allotments.length === 0 && !loading ? (
        <p>No previous allotments found.</p>
      ) : (
        allotments.map(allotment => (
          <div key={allotment.id} className="border rounded-lg p-4 shadow mb-4">
            <h2 className="text-xl font-bold mb-2">
              Allotment Batch: {new Date(allotment.timestamp).toLocaleString()}
            </h2>
            <h3 className="font-bold mt-4">Departments</h3>
            <ul>
              {allotment.departments.map(dept => (
                <li key={dept.id} className="mb-2">
                  <strong>{dept.name}</strong> - Capacity: {dept.capacity}, Allocated: {dept.allocated_seats.length}
                </li>
              ))}
            </ul>

            <h3 className="font-bold mt-4">Allocated Students</h3>
            <ul>
              {allotment.students.map(student => (
                <li key={student.id} className="mb-1">
                  {student.name} - <strong>{student.allocated_department}</strong> ({student.seat_type})
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </div>
  );
};

export default AllotmentResults;
