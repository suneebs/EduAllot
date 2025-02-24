import React, { useState } from "react";
import ReleaseApplication from "./ReleaseApplication";
import Submissions from "./Submissions";
import AdminAllotment from "./AdminAllotment";
import AddDepartmentForm from "./AddDepartmentForm";

function AdminDashboard() {
  const [activeComponent, setActiveComponent] = useState("dashboard");
  return (
    <div className="container mt-5">
      <h2>Admin Dashboard</h2>
      
      {/* Navigation Buttons */}
      <div className="d-flex gap-2 mb-3">
        <button className="btn btn-primary" onClick={() => setActiveComponent("createForm")}>
          Create Form
        </button>
        <button className="btn btn-secondary" onClick={() => setActiveComponent("dashboard")}>
          Home
        </button>
        <button className="btn btn-secondary" onClick={() => setActiveComponent("submissions")}>
        Submissions
        </button>
        <button className="btn btn-secondary" onClick={() => setActiveComponent("allotments")}>
        Allotments
        </button>
        <button className="btn btn-secondary" onClick={() => setActiveComponent("adddepartmentdata")}>
        AddDepartmentForm
        </button>
      </div>

      {/* Dynamic Component Rendering */}
      <div className="card p-4 shadow">
        {activeComponent === "createForm" && <ReleaseApplication />}
        {activeComponent === "submissions" && <Submissions />}
        {activeComponent === "allotments" && <AdminAllotment />}
        {activeComponent === "adddepartmentdata" && <AddDepartmentForm />}
        {activeComponent === "dashboard" && <h4>Welcome to the Admin Dashboard</h4>}
      </div>
    </div>
  )
}

export default AdminDashboard