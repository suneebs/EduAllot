import React, { useState, useEffect } from "react";
import { db } from "../../utils/firebase";
import { doc, setDoc, getDocs, collection } from "firebase/firestore";

function AddDepartmentForm() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, "departments"));
      const deptData = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          name: doc.id,
          totalSeats: data.totalSeats || 0,
          // Initialize seat counts
          seatCounts: {
            general: data.seatCounts?.general || 0,
            sc: data.seatCounts?.sc || 0,
            st: data.seatCounts?.st || 0,
            oec: data.seatCounts?.oec || 0
          },
          // Preserve existing allocations arrays but don't display them
          general: data.general || [],
          reserved: data.reserved || {
            SC: [],
            ST: [],
            OEC: []
          }
        };
      });
      setDepartments(deptData);
    } catch (error) {
      console.error("Error fetching departments: ", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (index, field, value) => {
    const updatedDepartments = departments.map((dept, i) => {
      if (i === index) {
        const numValue = parseInt(value) || 0;
        
        if (field.startsWith('seatCounts.')) {
          const category = field.split('.')[1];
          return {
            ...dept,
            seatCounts: {
              ...dept.seatCounts,
              [category]: numValue
            }
          };
        }
        return { ...dept, [field]: numValue };
      }
      return dept;
    });
    setDepartments(updatedDepartments);
  };

  const calculateTotalSeats = (dept) => {
    return Object.values(dept.seatCounts).reduce((sum, count) => sum + count, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      for (const dept of departments) {
        const totalSeats = calculateTotalSeats(dept);
        
        // Prepare the document data
        const deptData = {
          totalSeats,
          // Store seat counts separately
          seatCounts: {
            general: dept.seatCounts.general,
            sc: dept.seatCounts.sc,
            st: dept.seatCounts.st,
            oec: dept.seatCounts.oec
          },
          // Preserve existing allocations
          general: dept.general || [],
          reserved: dept.reserved || {
            SC: [],
            ST: [],
            OEC: []
          },
          // Add quota fields for allotment system
          SC: dept.seatCounts.sc,
          ST: dept.seatCounts.st,
          OEC: dept.seatCounts.oec
        };

        await setDoc(doc(db, "departments", dept.name), deptData);
      }
      alert("Departments updated successfully!");
      await fetchDepartments();
    } catch (error) {
      console.error("Error updating departments: ", error);
      alert("Error updating departments. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="container">Loading...</div>;
  }

  return (
    <div className="container">
      <h2 className="mb-4">Department Seat Configuration</h2>

      {/* View-only table */}
      <div className="table-responsive mb-5">
        <table className="table table-bordered">
          <thead className="table-light">
            <tr>
              <th>Department</th>
              <th>Total Seats</th>
              <th>General</th>
              <th>SC Reserved</th>
              <th>ST Reserved</th>
              <th>OEC Reserved</th>
            </tr>
          </thead>
          <tbody>
            {departments.map((dept) => (
              <tr key={dept.id}>
                <td>{dept.name}</td>
                <td>{calculateTotalSeats(dept)}</td>
                <td>{dept.seatCounts.general}</td>
                <td>{dept.seatCounts.sc}</td>
                <td>{dept.seatCounts.st}</td>
                <td>{dept.seatCounts.oec}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="mb-4">Update Seat Counts</h3>
      <form onSubmit={handleSubmit}>
        {departments.map((dept, index) => (
          <div key={index} className="card mb-4">
            <div className="card-header">
              <h4 className="mb-0">{dept.name} Department</h4>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">General Seats:</label>
                  <input
                    type="number"
                    className="form-control"
                    min="0"
                    value={dept.seatCounts.general}
                    onChange={(e) => handleChange(index, "seatCounts.general", e.target.value)}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">SC Reserved Seats:</label>
                  <input
                    type="number"
                    className="form-control"
                    min="0"
                    value={dept.seatCounts.sc}
                    onChange={(e) => handleChange(index, "seatCounts.sc", e.target.value)}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">ST Reserved Seats:</label>
                  <input
                    type="number"
                    className="form-control"
                    min="0"
                    value={dept.seatCounts.st}
                    onChange={(e) => handleChange(index, "seatCounts.st", e.target.value)}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">OEC Reserved Seats:</label>
                  <input
                    type="number"
                    className="form-control"
                    min="0"
                    value={dept.seatCounts.oec}
                    onChange={(e) => handleChange(index, "seatCounts.oec", e.target.value)}
                  />
                </div>
                <div className="col-12">
                  <p className="text-info">
                    Total Seats: {calculateTotalSeats(dept)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}

export default AddDepartmentForm;