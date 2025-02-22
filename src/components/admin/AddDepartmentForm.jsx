import React, { useState, useEffect } from "react";
import { db } from "../../utils/firebase";
import { doc, setDoc, getDocs, collection } from "firebase/firestore";

function AddDepartmentForm() {
  const [departments, setDepartments] = useState([]);

  // Fetch department data from Firebase
  useEffect(() => {
    fetchDepartments();
  }, []);

    const fetchDepartments = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "departments"));
        const deptData = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            name: doc.id,
            totalSeats: data.totalSeats || 0,
            general: data.general || 0,
            reserved: {
              Sc: data.reserved?.Sc || 0,
              St: data.reserved?.St || 0,
              OEC: data.reserved?.OEC || 0,
            },
          };
        });
        setDepartments(deptData);
      } catch (error) {
        console.error("Error fetching departments: ", error);
      }
    };


  // Handle input changes
  const handleChange = (index, field, value) => {
    const updatedDepartments = departments.map((dept, i) => {
      if (i === index) {
        if (field.includes("reserved")) {
          const [_, nestedField] = field.split(".");
          return {
            ...dept,
            reserved: {
              ...dept.reserved,
              [nestedField]: Number(value),
            },
          };
        }
        return { ...dept, [field]: Number(value) };
      }
      return dept;
    });

    setDepartments(updatedDepartments);
  };

  // Save updated data to Firebase
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      for (const dept of departments) {
        await setDoc(doc(db, "departments", dept.name), {
          totalSeats: dept.general+dept.reserved.Sc+dept.reserved.St+dept.reserved.OEC,
          general: dept.general,
          reserved: {
            Sc: dept.reserved.Sc,
            St: dept.reserved.St,
            OEC: dept.reserved.OEC,
          },
        });
      }
      alert("Departments updated successfully!");
    } catch (error) {
      console.error("Error updating departments: ", error);
    }
    fetchDepartments();
  };

  return (
    <div className="container">
      <h2>Department Seat Details</h2>

      {/* Department details table */}
      <table className="table table-bordered">
        <thead>
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
              <td>{dept.totalSeats}</td>
              <td>{dept.general}</td>
              <td>{dept.reserved.Sc}</td>
              <td>{dept.reserved.St}</td>
              <td>{dept.reserved.OEC}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Update Department Details</h2>
      <form onSubmit={handleSubmit}>
        {departments.map((dept, index) => (
          <div key={index} className="card p-3 mb-3">
            <h3>{dept.name} Department</h3>

            <label>Total Seats:</label>
            <input
              type="number"
              value={dept.totalSeats}
              onChange={(e) => handleChange(index, "totalSeats", e.target.value)}
            />

            <label>General Seats:</label>
            <input
              type="number"
              value={dept.general}
              onChange={(e) => handleChange(index, "general", e.target.value)}
            />

            <label>SC Reserved Seats:</label>
            <input
              type="number"
              value={dept.reserved.Sc}
              onChange={(e) =>
                handleChange(index, "reserved.Sc", e.target.value)
              }
            />

            <label>ST Reserved Seats:</label>
            <input
              type="number"
              value={dept.reserved.St}
              onChange={(e) =>
                handleChange(index, "reserved.St", e.target.value)
              }
            />

            <label>OEC Reserved Seats:</label>
            <input
              type="number"
              value={dept.reserved.OEC}
              onChange={(e) =>
                handleChange(index, "reserved.OEC", e.target.value)
              }
            />
          </div>
        ))}
        <button type="submit" className="btn btn-primary">
          Save Departments
        </button>
      </form>
    </div>
  );
}

export default AddDepartmentForm;
