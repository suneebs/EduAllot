import React, { useState, useEffect } from "react";
import { db } from "../../utils/firebase"; // Ensure Firebase is configured
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { format } from "date-fns";

function FormListing() {
    const [forms, setForms] = useState([]);
    const [formData, setFormData] = useState({ name: "", email: "" }); // Example fields
    const [selectedFormId, setSelectedFormId] = useState(null);
    const [successMessage, setSuccessMessage] = useState("");

    useEffect(() => {
        const fetchForms = async () => {
            const today = new Date();
            const q = query(collection(db, "forms"), where("endDate", ">=", today));
            const querySnapshot = await getDocs(q);
            const formList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            setForms(formList);
        };
        fetchForms();
    }, []);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedFormId) return;

        try {
            await addDoc(collection(db, "form_submissions"), {
                formId: selectedFormId,
                name: formData.name,
                email: formData.email,
                submittedAt: new Date(),
            });
            setSuccessMessage("Form submitted successfully!");
            setFormData({ name: "", email: "" }); // Reset form fields
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
                            <p className="text-muted">
                                End Date: {form.endDate && form.endDate.toDate ? format(form.endDate.toDate(), "yyyy-MM-dd") : "Invalid Date"}
                            </p>
                            <button className="btn btn-success" onClick={() => setSelectedFormId(form.id)}>Fill Form</button>
                        </div>
                    ))
                ) : (
                    <p>No active forms available.</p>
                )}
            </div>

            {selectedFormId && (
                <div className="card p-4 mt-4 shadow">
                    <h3>Submit Form</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="form-label">Name</label>
                            <input type="text" name="name" className="form-control" value={formData.name} onChange={handleInputChange} required />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Email</label>
                            <input type="email" name="email" className="form-control" value={formData.email} onChange={handleInputChange} required />
                        </div>
                        <button type="submit" className="btn btn-primary">Submit</button>
                    </form>
                    {successMessage && <p className="text-success mt-3">{successMessage}</p>}
                </div>
            )}
        </div>
    );
}

export default FormListing;
