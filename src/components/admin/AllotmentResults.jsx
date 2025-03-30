import React, { useState, useEffect } from "react";
import { db } from "../../utils/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import LoadingSpinner from "../Shared/LoadingSpinner";

const AllotmentResults = ({ onClose }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const allotmentRef = collection(db, "published_allotments");
        const q = query(allotmentRef, orderBy("timestamp", "desc"));
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          setResults(snapshot.docs[0].data());
        } else {
          setError("No published allotment found.");
        }
      } catch (err) {
        console.error("Error fetching published results:", err);
        setError("Failed to fetch results.");
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  return (
    <div className="fixed inset-0 flex justify-center items-center p-4">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-3xl relative">
        
        <h2 className="text-2xl font-semibold mb-4">Allotment Results</h2>

        {loading ? (
          <div className="flex justify-center items-center py-4">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <div className="overflow-y-auto max-h-96">
            <table className="table-auto w-full border-collapse border border-gray-400">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border px-4 py-2">Student Name</th>
                  <th className="border px-4 py-2">Allocated Department</th>
                  <th className="border px-4 py-2">Seat Type</th>
                </tr>
              </thead>
              <tbody>
                {results.students.map((student) => (
                  <tr key={student.id}>
                    <td className="border px-4 py-2">{student.name}</td>
                    <td className="border px-4 py-2">{student.allocated_department || "Not Allocated"}</td>
                    <td className="border px-4 py-2">{student.seat_type || "General"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllotmentResults;
