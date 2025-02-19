import React, { useState, useEffect } from "react";
import { db } from "../../utils/firebase"; // Ensure Firebase is configured
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { format } from "date-fns";



function ReleaseApplication() {
    const [formTitle, setFormTitle] = useState("");
    const [fields, setFields] = useState({ name: false, email: false, phone: false, address: false });
    const [endDate, setEndDate] = useState("");

    const handleFieldChange = (e) => {
        setFields({ ...fields, [e.target.name]: e.target.checked });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await addDoc(collection(db, "forms"), {
                formTitle,
                fields,
                endDate: new Date(endDate),
                createdAt: new Date(),
            });
            alert("Form Created Successfully!");
            setFormTitle("");
            setFields({ name: false, email: false, phone: false, address: false });
            setEndDate("");
        } catch (error) {
            console.error("Error creating form: ", error);
        }
    };
  return (
    <div className="container mt-5">
            <div className="card p-4 shadow">
                <h2 className="mb-4">Create New Application Form</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Form Title"
                            value={formTitle}
                            onChange={(e) => setFormTitle(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <h5>Select Fields to Collect</h5>
                        {Object.keys(fields).map((field) => (
                            <div className="form-check" key={field}>
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    name={field}
                                    checked={fields[field]}
                                    onChange={handleFieldChange}
                                />
                                <label className="form-check-label">
                                    {field.charAt(0).toUpperCase() + field.slice(1)}
                                </label>
                            </div>
                        ))}
                    </div>
                    <div className="mb-3">
                        <input
                            type="date"
                            className="form-control"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary">Create Form</button>
                </form>
            </div>
        </div>
  )
}

export default ReleaseApplication