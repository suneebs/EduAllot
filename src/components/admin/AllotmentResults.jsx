import React, { useState, useEffect } from "react";
import { db } from "../../utils/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import LoadingSpinner from "../Shared/LoadingSpinner";

const AllotmentResults = ({ onClose }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);
  const [selectedDept, setSelectedDept] = useState(null);
  const [allDepartments, setAllDepartments] = useState([]);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const allotmentRef = collection(db, "published_allotments");
        const q = query(allotmentRef, orderBy("timestamp", "desc"));
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          const data = snapshot.docs[0].data();
          setResults(data);
          const uniqueDepartments = [...new Set(data.students.map(s => s.allocated_department))];
          setAllDepartments(uniqueDepartments.filter(d => d));
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

  const filteredStudents = selectedDept
    ? results?.students.filter(student => student.allocated_department === selectedDept)
    : results?.students;

  return (
    <div className="fixed inset-0 flex justify-center items-center  bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl p-8 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition"
        >
          ✕
        </button>

        {/* Header */}
        <h2 className="text-3xl font-semibold text-gray-800 mb-6 text-center">
          Allotment Results
        </h2>

        {/* Loading / Error */}
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <p className="text-center text-red-600 text-lg">{error}</p>
        ) : (
          <>
            {/* Department Filter Buttons */}
            <div className="flex flex-wrap justify-center gap-3 mb-6">
              <button
                className={`px-4 py-2 rounded-full border transition-all duration-200 ${
                  !selectedDept
                    ? "bg-blue-600 text-white shadow"
                    : "bg-gray-100 text-gray-700 hover:bg-blue-100"
                }`}
                onClick={() => setSelectedDept(null)}
              >
                All Departments
              </button>
              {allDepartments.map((dept) => (
                <button
                  key={dept}
                  onClick={() => setSelectedDept(dept)}
                  className={`px-4 py-2 rounded-full border transition-all duration-200 ${
                    selectedDept === dept
                      ? "bg-blue-600 text-white shadow"
                      : "bg-gray-100 text-gray-700 hover:bg-blue-100"
                  }`}
                >
                  {dept}
                </button>
              ))}
            </div>

            {/* Table */}
            <div className="overflow-y-auto max-h-[420px] border rounded-lg">
              <table className="w-full text-sm text-left border-collapse">
                <thead className="bg-blue-50 text-gray-700 text-sm sticky top-0 z-10">
                  <tr>
                    <th className="px-5 py-3 border-b">Student Name</th>
                    <th className="px-5 py-3 border-b">Allocated Department</th>
                    <th className="px-5 py-3 border-b">Seat Type</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td
                        colSpan="3"
                        className="text-center py-6 text-gray-500 italic"
                      >
                        No students found for {selectedDept}.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((student) => (
                      <tr
                        key={student.id}
                        className="even:bg-gray-50 hover:bg-blue-50 transition"
                      >
                        <td className="px-5 py-3 border-b">{student.name}</td>
                        <td className="px-5 py-3 border-b">
                          {student.allocated_department}
                        </td>
                        <td className="px-5 py-3 border-b">
                          {student.seat_type || "General"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AllotmentResults;
