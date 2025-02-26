import React, { useState, useEffect } from "react";
import { db } from "../../utils/firebase";
import { doc, setDoc, getDocs, collection } from "firebase/firestore";

function AddDepartments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    // Define the initial departments
    const initialDepartments = [
      {
        id: "ee",
        name: "ee",
        capacity: 30,
        reserved: {
          SC: 1,
          ST: 1,
          OEC: 1,
          OBC: 1,
          general: 26
        },
        allocatedSeats: []
      },
      {
        id: "ec",
        name: "ec",
        capacity: 30,
        reserved: {
          SC: 1,
          ST: 1,
          OEC: 1,
          OBC: 1,
          general: 26
        },
        allocatedSeats: []
      },
      {
        id: "mech",
        name: "mech",
        capacity: 30,
        reserved: {
          SC: 1,
          ST: 1,
          OEC: 1,
          OBC: 1,
          general: 26
        },
        allocatedSeats: []
      }
    ];

    setDepartments(initialDepartments);
    checkExistingDepartments();
  }, []);

  const checkExistingDepartments = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, "departments"));
      const existingDepts = querySnapshot.docs.map(doc => doc.id);
      
      if (existingDepts.includes("ee") || existingDepts.includes("ec") || existingDepts.includes("mech")) {
        setMessage({
          text: "Some departments already exist. Adding new departments may overwrite existing data.",
          type: "warning"
        });
      }
    } catch (error) {
      console.error("Error checking departments: ", error);
      setMessage({
        text: "Error checking existing departments.",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (index, field, value) => {
    const updatedDepartments = departments.map((dept, i) => {
      if (i === index) {
        const numValue = parseInt(value) || 0;
        if (field.startsWith('reserved.')) {
          const category = field.split('.')[1];
          const newReserved = {
            ...dept.reserved,
            [category]: numValue
          };
          
          // Calculate total seats
          const totalReserved = Object.values(newReserved).reduce((sum, val) => sum + val, 0);
          
          return {
            ...dept,
            reserved: newReserved,
            capacity: totalReserved
          };
        }
        return { ...dept, [field]: numValue };
      }
      return dept;
    });
    setDepartments(updatedDepartments);
  };

  const validateDepartments = () => {
    for (const dept of departments) {
      const totalReserved = Object.values(dept.reserved).reduce((sum, val) => sum + val, 0);
      
      if (totalReserved !== dept.capacity) {
        setMessage({
          text: `Department ${dept.name}: Total seats (${totalReserved}) must equal capacity (${dept.capacity})`,
          type: "error"
        });
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateDepartments()) {
      return;
    }
    
    setLoading(true);
    setMessage({ text: "", type: "" });
    
    try {
      for (const dept of departments) {
        const deptData = {
          capacity: dept.capacity,
          reserved: dept.reserved,
          allocatedSeats: dept.allocatedSeats
        };

        await setDoc(doc(db, "departments", dept.name), deptData);
      }
      setMessage({
        text: "Departments added successfully!",
        type: "success"
      });
    } catch (error) {
      console.error("Error adding departments: ", error);
      setMessage({
        text: "Error adding departments. Please try again.",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxHeight: "580px", overflowY: "auto" }}>
      <h2 className="mb-4">Add New Departments</h2>
      
      {message.text && (
        <div className={`alert alert-${message.type === "success" ? "success" : message.type === "warning" ? "warning" : "danger"} mb-4`}>
          {message.text}
        </div>
      )}

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
                <td>{dept.name}</td>
                <td>{dept.capacity}</td>
                <td>{dept.reserved.general}</td>
                <td>{dept.reserved.SC}</td>
                <td>{dept.reserved.ST}</td>
                <td>{dept.reserved.OEC}</td>
                <td>{dept.reserved.OBC}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="mb-4">Update Department Configurations</h3>
      <form onSubmit={handleSubmit}>
        {departments.map((dept, index) => (
          <div key={index} className="card mb-4" >
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
                    value={dept.reserved.general}
                    onChange={(e) => handleChange(index, "reserved.general", e.target.value)}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">SC Reserved Seats:</label>
                  <input
                    type="number"
                    className="form-control"
                    min="0"
                    value={dept.reserved.SC}
                    onChange={(e) => handleChange(index, "reserved.SC", e.target.value)}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">ST Reserved Seats:</label>
                  <input
                    type="number"
                    className="form-control"
                    min="0"
                    value={dept.reserved.ST}
                    onChange={(e) => handleChange(index, "reserved.ST", e.target.value)}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">OEC Reserved Seats:</label>
                  <input
                    type="number"
                    className="form-control"
                    min="0"
                    value={dept.reserved.OEC}
                    onChange={(e) => handleChange(index, "reserved.OEC", e.target.value)}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">OBC Reserved Seats:</label>
                  <input
                    type="number"
                    className="form-control"
                    min="0"
                    value={dept.reserved.OBC}
                    onChange={(e) => handleChange(index, "reserved.OBC", e.target.value)}
                  />
                </div>
                <div className="col-12">
                  <div className="alert alert-info">
                    Total capacity: {dept.capacity} seats (sum of all category seats)
                  </div>
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
          {loading ? "Adding Departments..." : "Add Departments"}
        </button>
      </form>
    </div>
  );
}

export default AddDepartments;