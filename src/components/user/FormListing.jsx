import React, { useState, useEffect } from "react";
import { db } from "../../utils/firebase";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { format } from "date-fns";

function FormListing() {
    const [forms, setForms] = useState([]);
    const [selectedForm, setSelectedForm] = useState(null);
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [reverify, setReverify] = useState(false);

    const initialFormData = {
        name: "",
        email: "",
        age: "",
        company: "",
        experience: "",
        address: "",
        highestEducation: "",
        mark: "",
        caste: "",
        distance: "",
        priorityChoices: { 1: "", 2: "", 3: "" },
    };

    const [formData, setFormData] = useState(initialFormData);

    useEffect(() => {
        const fetchForms = async () => {
            try {
                const today = new Date();
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
            await addDoc(collection(db, "form_submissions"), {
                formId: selectedForm.id,
                ...formData,
                submittedAt: new Date(),
            });

            setFormSubmitted(true);
            setTimeout(() => {
                setSelectedForm(null);
                setFormSubmitted(false);
            }, 3000);

            setFormData(initialFormData);
            setReverify(false);
        } catch (error) {
            console.error("Error submitting form:", error);
        }
    };

    return (
        <div className="container mt-5">
            <div className="card p-4 shadow">
                <h2 className="mb-4">Available Forms</h2>
                {forms.length > 0 ? (
                    forms.map((form) => (
                        <div key={form.id} className="border-bottom py-3">
                            <h5>{form.formTitle}</h5>
                            <p>{form.description}</p>
                            <p className="text-muted">
                                End Date:{" "}
                                {form.endDate?.toDate ? format(form.endDate.toDate(), "yyyy-MM-dd") : "Invalid Date"}
                            </p>
                            <button className="btn btn-success" onClick={() => setSelectedForm(form)}>
                                Fill Form
                            </button>
                        </div>
                    ))
                ) : (
                    <p>No active forms available.</p>
                )}
            </div>

            {formSubmitted && (
                <div className="alert alert-success text-center mt-4">
                    ✅ Form submitted successfully!
                </div>
            )}

            {selectedForm && !formSubmitted && (
                <div className="card p-4 mt-4 shadow">
                    <h3>{selectedForm.formTitle}</h3>
                    <p>{selectedForm.description}</p>
                    <form onSubmit={handleSubmit}>
                        {[
                            { label: "Name", name: "name", type: "text" },
                            { label: "Email", name: "email", type: "email" },
                            { label: "Age", name: "age", type: "number" },
                            { label: "Company", name: "company", type: "text" },
                            { label: "Experience (Years)", name: "experience", type: "number" },
                            { label: "Address", name: "address", type: "text" },
                            { label: "Highest Education", name: "highestEducation", type: "text" },
                            { label: "Mark (%)", name: "mark", type: "number" },
                            { label: "Caste", name: "caste", type: "text" },
                            { label: "Distance (km)", name: "distance", type: "number" },
                        ].map((field, index) => (
                            <div className="mb-3" key={index}>
                                <label className="form-label">{field.label}</label>
                                <input
                                    type={field.type}
                                    name={field.name}
                                    className="form-control"
                                    value={formData[field.name]}
                                    onChange={handleInputChange}
                                    required
                                />
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

                        <button type="submit" className="btn btn-primary" disabled={!reverify}>
                            Submit
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}

export default FormListing;
