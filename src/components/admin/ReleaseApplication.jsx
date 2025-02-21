import React, { useState, useEffect } from "react";
import { db } from "../../utils/firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import * as XLSX from "xlsx";
import LoadingSpinner from "../Shared/LoadingSpinner";

function ReleaseApplication() {
    const [form, setForm] = useState(null);
    const [formTitle, setFormTitle] = useState("");
    const [description, setDescription] = useState("");
    const [endDate, setEndDate] = useState("");

    useEffect(() => {
        fetchForm();
    }, []);

    const fetchForm = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "forms"));
            const formList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            setForm(formList.length > 0 ? formList[0] : null);
        } catch (error) {
            console.error("Error fetching form:", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await addDoc(collection(db, "forms"), { formTitle, description, endDate, createdAt: new Date() });
            alert("Form Created Successfully!");
            fetchForm();
        } catch (error) {
            console.error("Error creating form: ", error);
        }
    };

    const handleDelete = async () => {
        if (window.confirm("Are you sure you want to delete this form?")) {
            try {
                await deleteDoc(doc(db, "forms", form.id));
                alert("Form Deleted Successfully!");
                setForm(null);
            } catch (error) {
                console.error("Error deleting form: ", error);
            }
        }
    };

    const handleExtendDate = async () => {
        const newDate = prompt("Enter new last date (YYYY-MM-DD):");
        if (newDate) {
            try {
                await updateDoc(doc(db, "forms", form.id), { endDate: newDate });
                alert("Date Extended Successfully!");
                fetchForm();
            } catch (error) {
                console.error("Error updating date: ", error);
            }
        }
    };


    return (
        <div className="container mt-5">
            {form ? (
                <div className="card p-4 shadow">
                    <h2>{form.formTitle}</h2>
                    <p>{form.description}</p>
                    <small>
    Last Date: {form.endDate}
</small>

                    <div className="mt-3">
                        <button className="btn btn-warning me-2" onClick={handleExtendDate}>
                            Extend Date
                        </button>
                        <button className="btn btn-danger" onClick={handleDelete}>
                            Delete
                        </button>
                    </div>
                </div>
            ) : (
                <div className="card p-4 shadow">
                    <h2>Create New Application Form</h2>
                    <form onSubmit={handleSubmit}>
                        <input type="text" className="form-control mb-3" placeholder="Form Title" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} required />
                        <textarea className="form-control mb-3" placeholder="Form Description" value={description} onChange={(e) => setDescription(e.target.value)} required />
                        <input type="date" className="form-control mb-3" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
                        <button type="submit" className="btn btn-primary">Create Form</button>
                    </form>
                </div>
            )}
        </div>
    );
}

export default ReleaseApplication;
