import React, { useState, useEffect } from "react";
import { db } from "../../utils/firebase";
import { getDocs, collection } from "firebase/firestore";

function Help() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "departments"));
      const fetchedDepartments = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setDepartments(fetchedDepartments);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching departments: ", error);
      setMessage({ text: "Failed to fetch departments.", type: "error" });
      setLoading(false);
    }
  };
  return (
    <>
    
    <div className="container" style={{ maxHeight: "580px", overflowY: "auto" }}>
      <h2 className="mb-4">Departmental Seat Details</h2>

      {message.text && (
        <div className={`alert alert-${message.type === "success" ? "success" : "danger"} mb-4`}>
          {message.text}
        </div>
      )}

      {loading ? (
        <p>Loading departments...</p>
      ) : (
        departments.length > 0 && (
          <div className="table-responsive mb-5">
            <table className="table table-bordered">
              <thead className="table-light">
                <tr>
                  <th>Department</th>
                  <th>Total Capacity</th>
                  <th>General</th>
                  <th>SC Reserved</th>
                  <th>ST Reserved</th>
                  <th>OEC Reserved</th>
                  <th>OBC Reserved</th>
                </tr>
              </thead>
              <tbody>
                {departments.map((dept) => (
                  <tr key={dept.id}>
                    <td>{dept.id}</td>
                    <td>{dept.capacity}</td>
                    <td>{dept.reserved?.general || 0}</td>
                    <td>{dept.reserved?.SC || 0}</td>
                    <td>{dept.reserved?.ST || 0}</td>
                    <td>{dept.reserved?.OEC || 0}</td>
                    <td>{dept.reserved?.OBC || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
    </>
  )
}

export default Help