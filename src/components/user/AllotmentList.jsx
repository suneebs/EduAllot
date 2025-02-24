import React, { useState, useEffect } from "react";
import { db } from "../../utils/firebase";
import { collection, getDocs } from "firebase/firestore";

const AllotmentList = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllotments();
  }, []);

  const fetchAllotments = async () => {
    try {
      const deptSnapshot = await getDocs(collection(db, "departments"));
      const deptData = deptSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setDepartments(deptData);
    } catch (error) {
      console.error("Error fetching allotments:", error);
    } finally {
      setLoading(false);
    }
  };

  const sortByDistance = (students) => {
    return [...students].sort((a, b) => a.distance - b.distance);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="text-xl">Loading allotments...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Department Allotment List</h2>
      
      <div className="grid md:grid-cols-3 gap-4">
        {departments.map((dept) => (
          <div key={dept.id} className="bg-white rounded-lg shadow-md">
            <div className="bg-blue-600 text-white p-3 rounded-t-lg">
              <h3 className="text-xl font-semibold">{dept.id}</h3>
              <p className="text-sm">Total Seats: {dept.totalSeats}</p>
            </div>

            <div className="p-4">
              <div className="mb-4">
                <h4 className="text-lg font-semibold mb-2">General Merit</h4>
                {dept.general && dept.general.length > 0 ? (
                  <ul className="space-y-2">
                    {sortByDistance(dept.general).map((student, index) => (
                      <li key={index} className="border-b pb-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{student.name}</span>
                          <span className="text-sm bg-gray-100 px-2 py-1 rounded">
                            Rank {index + 1}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          Distance: {student.distance} km
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No general merit allotments</p>
                )}
              </div>

              <div>
                <h4 className="text-lg font-semibold mb-2">Reserved Categories</h4>
                {dept.reserved ? (
                  Object.entries(dept.reserved).map(([category, students]) => (
                    <div key={category} className="mb-4">
                      <h5 className="font-medium text-gray-700 mb-2">{category}</h5>
                      {Array.isArray(students) && students.length > 0 ? (
                        <ul className="space-y-2">
                          {sortByDistance(students).map((student, index) => (
                            <li key={index} className="border-b pb-2">
                              <div className="flex justify-between items-center">
                                <span>{student.name}</span>
                                <span className="text-sm bg-gray-100 px-2 py-1 rounded">
                                  Rank {index + 1}
                                </span>
                              </div>
                              <div className="text-sm text-gray-600">
                                Distance: {student.distance} km
                              </div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-500">No {category} allotments</p>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No reserved category allotments</p>
                )}
              </div>
            </div>

            <div className="bg-gray-50 p-3 rounded-b-lg">
              <div className="text-sm text-gray-600">
                <div>General Seats Filled: {dept.general?.length || 0}</div>
                <div>Reserved Seats Filled: {
                  Object.values(dept.reserved || {}).reduce((total, students) => 
                    total + (Array.isArray(students) ? students.length : 0), 0)
                }</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AllotmentList;