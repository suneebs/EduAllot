import React, { useState } from "react";
import FormListing from "./FormListing";


function User() {
  const [activeComponent, setActiveComponent] = useState("user");
  return (
    <div className="container mt-5">
      <h2>User Dashboard</h2>
      
      {/* Navigation Buttons */}
      <div className="d-flex gap-2 mb-3">
        <button className="btn btn-primary" onClick={() => setActiveComponent("listform")}>
          Application Form
        </button>
        <button className="btn btn-secondary" onClick={() => setActiveComponent("user")}>
          Home
        </button>
       
        <button className="btn btn-secondary"> <a href="/">Back</a>
        
        </button>
      </div>

      {/* Dynamic Component Rendering */}
      <div className="card p-4 shadow">
        {activeComponent === "listform" && <FormListing />}
        {activeComponent === "user" && 
        <>
        <h3>Welcome to UserPage</h3>
        </>
        }
      </div>
    </div>
  )
}

export default User