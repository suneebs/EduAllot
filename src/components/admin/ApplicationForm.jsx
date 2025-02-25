import React, {useState, useEffect} from 'react';
import { db } from "../../utils/firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { format } from 'date-fns';



function ApplicationForm() {
  const [form, setForm] = useState(null);
    const [formTitle, setFormTitle] = useState("");
    const [description, setDescription] = useState("");
    const [endDate, setEndDate] = useState("");
    const [showDateExtend, setShowDateExtend] = useState(false);
    const [newEndDate, setNewEndDate] = useState("");

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
        
        // Validate that selected date is not in the past
        const selectedDate = new Date(endDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (selectedDate < today) {
            alert("Please select a future date");
            return;
        }

        try {
            await addDoc(collection(db, "forms"), { 
                formTitle, 
                description, 
                endDate, 
                createdAt: new Date() 
            });
            alert("Form Created Successfully!");
            fetchForm();
            // Reset form fields
            setFormTitle("");
            setDescription("");
            setEndDate("");
        } catch (error) {
            console.error("Error creating form: ", error);
        }
    };

    const handleDelete = async () => {
        let confirmdelete = window.prompt("Type 'confirmdelete' To Delete Form");
        if (confirmdelete === "confirmdelete") {
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
        if (!newEndDate) {
            alert("Please select a new date");
            return;
        }

        const selectedDate = new Date(newEndDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (selectedDate < today) {
            alert("Please select a future date");
            return;
        }

        try {
            await updateDoc(doc(db, "forms", form.id), { endDate: newEndDate });
            alert("Date Extended Successfully!");
            setShowDateExtend(false);
            setNewEndDate("");
            fetchForm();
        } catch (error) {
            console.error("Error updating date: ", error);
        }
    };

    const getCurrentDate = () => {
        return format(new Date(), 'yyyy-MM-dd');
    };

    return (
        <div className="container mt-5">
            {form ? (
                <div className="card p-4 shadow">
                    <h2>{form.formTitle}</h2>
                    <p>{form.description}</p>
                    <small>Last Date: {form.endDate}</small>

                    <div className="mt-3">
                        {showDateExtend ? (
                            <div className="mb-3">
                                <div className="input-group">
                                    <input 
                                        type="date" 
                                        className="form-control"
                                        value={newEndDate}
                                        onChange={(e) => setNewEndDate(e.target.value)}
                                        min={getCurrentDate()}
                                    />
                                    <button 
                                        className="btn btn-primary"
                                        onClick={handleExtendDate}
                                    >
                                        Confirm
                                    </button>
                                    <button 
                                        className="btn btn-secondary"
                                        onClick={() => {
                                            setShowDateExtend(false);
                                            setNewEndDate("");
                                        }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button 
                                className="btn btn-warning me-2" 
                                onClick={() => setShowDateExtend(true)}
                            >
                                Extend Date
                            </button>
                        )}
                        <button className="btn btn-danger" onClick={handleDelete}>
                            Delete
                        </button>
                    </div>
                </div>
            ) : (
                <div className="card p-4 shadow">
                    <h2>Create New Application Form</h2>
                    <form onSubmit={handleSubmit}>
                        <input 
                            type="text" 
                            className="form-control mb-3" 
                            placeholder="Form Title" 
                            value={formTitle} 
                            onChange={(e) => setFormTitle(e.target.value)} 
                            required 
                        />
                        <textarea 
                            className="form-control mb-3" 
                            placeholder="Form Description" 
                            value={description} 
                            onChange={(e) => setDescription(e.target.value)} 
                            required 
                        />
                        <input 
                            type="date" 
                            className="form-control mb-3" 
                            value={endDate} 
                            onChange={(e) => setEndDate(e.target.value)}
                            min={getCurrentDate()}
                            required 
                        />
                        <button type="submit" className="btn btn-primary">Create Form</button>
                    </form>
                </div>
            )}
        </div>
    );
}

export default ApplicationForm