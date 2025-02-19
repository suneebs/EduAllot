import React, { useState, useEffect } from "react";
import { db } from "../../utils/firebase"; // Ensure Firebase is configured
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { format } from "date-fns";



function FormListing() {
    const [forms, setForms] = useState([]);

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

                            <button className="btn btn-success">Fill Form</button>
                        </div>
                    ))
                ) : (
                    <p>No active forms available.</p>
                )}
            </div>
        </div>
  )
}

export default FormListing