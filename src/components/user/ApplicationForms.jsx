import React, { useState, useEffect } from "react";
import { db } from "../../utils/firebase";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";

function ApplicationForms() {
    const [forms, setForms] = useState([]);
    const [selectedForm, setSelectedForm] = useState(null);
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [reverify, setReverify] = useState(false);
    const [showForm, setShowForm] = useState(false);

    const initialFormData = {
        adharNumber: "",
        name: "",
        email: "",
        age: "",
        company: "",
        experience: "",
        address: "",
        highestEducation: "",
        mark: "",
        category: "",
        distance: "",
        priorityChoices: { 1: "", 2: "", 3: "" },
    };

    const formatDate = (date) => {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const [formData, setFormData] = useState(initialFormData);

    useEffect(() => {
        const fetchForms = async () => {
            try {
                const d = new Date();
                const today = formatDate(d);
                const q = query(collection(db, "forms"), where("endDate", ">=", today));
                const querySnapshot = await getDocs(q);

                const formList = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));

                setForms(formList);
            } catch (error) {
                console.error("Error fetching forms:", error);
            }
        };

        fetchForms();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === "adharNumber" && value.length > 12) return;
        setFormData({ ...formData, [name]: value });
    };

    const handlePriorityChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => {
            let updatedPriorities = { ...prevData.priorityChoices, [name]: value };
            let values = Object.values(updatedPriorities).filter((val) => val !== "");
            let uniqueValues = [...new Set(values)];

            if (values.length !== uniqueValues.length) {
                updatedPriorities[name] = "";
            }

            return { ...prevData, priorityChoices: updatedPriorities };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedForm || !reverify) return;

        try {
            const adharQuery = query(collection(db, "form_submissions"), where("adharNumber", "==", formData.adharNumber));
            const adharSnapshot = await getDocs(adharQuery);

            if (!adharSnapshot.empty) {
                alert("Adhar number already exists!");
                return;
            }

            await addDoc(collection(db, "form_submissions"), {
                formId: selectedForm.id,
                ...formData,
                submittedAt: new Date(),
            });

            setFormSubmitted(true);
            setTimeout(() => {
                setSelectedForm(null);
                setFormSubmitted(false);
                setShowForm(false);
            }, 3000);

            setFormData(initialFormData);
            setReverify(false);
        } catch (error) {
            console.error("Error submitting form:", error);
        }
    };

    return (
        <div className="container mt-5">
        {!selectedForm && (

           
            <div className="card p-4 shadow">
                <h2 className="mb-4">Available Forms</h2>
                {forms.length > 0 ? (
                    forms.map((form) => (
                        <div key={form.id} className="border-bottom py-3">
                            <h5>{form.formTitle}</h5>
                            <p>{form.description}</p>
                            <p className="text-muted">End Date: {form.endDate}</p>
                            <button className="btn btn-success" onClick={() => { setSelectedForm(form); setShowForm(true); }}>
                                Fill Form
                            </button>
                        </div>
                    ))
                ) : (
                    <p>No active forms available.</p>
                )}
            </div>
        )}
        

            {formSubmitted && (
                <div className="alert alert-success text-center mt-4">Your Application Submitted successfully!</div>
            )}

            {selectedForm && showForm && !formSubmitted && (
                <div className="card p-4 mt-4 shadow" style={{ maxHeight: "580px", overflowY: "auto" }}>
                    <h3>{selectedForm.formTitle}</h3>
                    <p>{selectedForm.description}</p>
                    <form onSubmit={handleSubmit}>
                        {[
                            { label: "Adhar Number", name: "adharNumber", type: "text" },
                            { label: "Name", name: "name", type: "text" },
                            { label: "Email", name: "email", type: "email" },
                            { label: "Age", name: "age", type: "number" },
                            { label: "Company", name: "company", type: "text" },
                            { label: "Experience (Years)", name: "experience", type: "number" },
                            { label: "Address", name: "address", type: "text" },
                            { label: "Highest Education", name: "highestEducation", type: "text" },
                            { label: "Mark (%)", name: "mark", type: "number" },
                            { label: "Category", name: "category", type: "select", options: ["SC", "ST", "OBC", "General", "OEC", "Others"] },
                            { label: "Distance (km)", name: "distance", type: "number" },
                        ].map((field, index) => (
                            <div className="mb-3" key={index}>
                                <label className="form-label">{field.label}</label>
                                {field.type === "select" ? (
                                    <select name={field.name} className="form-control" value={formData[field.name]} onChange={handleInputChange} required>
                                        <option value="">Select</option>
                                        {field.options.map((option) => <option key={option} value={option}>{option}</option>)}
                                    </select>
                                ) : (
                                    <input type={field.type} name={field.name} className="form-control" value={formData[field.name]} onChange={handleInputChange} required />
                                )}
                            </div>
                        ))}
                        <h5>Priority Selection</h5>
                        {["1", "2", "3"].map((priority, index) => {
                            const selectedPriorities = Object.values(formData.priorityChoices).filter((val) => val !== "");

                            return (
                                <div className="mb-3" key={index}>
                                    <label className="form-label">Priority {index + 1}</label>
                                    <select
                                        name={priority}
                                        className="form-control"
                                        value={formData.priorityChoices[priority]}
                                        onChange={handlePriorityChange}
                                        required={index === 0}
                                    >
                                        <option value="">Select</option>
                                        {["EE", "EC", "MECH"].map((option) => (
                                            <option
                                                key={option}
                                                value={option}
                                                disabled={index > 0 && selectedPriorities.includes(option)}
                                            >
                                                {option}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            );
                        })}

                           <div className="form-check mb-3">
                            <input
                                className="form-check-input"
                                type="checkbox"
                                id="reverify"
                                checked={reverify}
                                onChange={() => setReverify(!reverify)}
                            />
                            <label className="form-check-label" htmlFor="reverify">
                                I verify that all details entered are correct
                            </label>
                        </div>

                        <button type="submit" className="btn btn-primary" disabled={!reverify}>Submit</button>
                    </form>
                </div>
            )}
        </div>
    );
}

export default ApplicationForms;