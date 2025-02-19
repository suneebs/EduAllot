import React, { useState, useEffect } from "react";
import { db } from "../../utils/firebase"; // Ensure Firebase is configured
import { collection, getDocs, query, where } from "firebase/firestore";
import { format } from "date-fns";

function Submissions() {
    const [submissions, setSubmissions] = useState([]);
    const [formTitle, setFormTitle] = useState("");

    useEffect(() => {
        const fetchSubmissions = async () => {
            const q = query(collection(db, "form_submissions"));
            const querySnapshot = await getDocs(q);
            const submissionList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            setSubmissions(submissionList);

            if (submissionList.length > 0) {
                const formId = submissionList[0].formId;
                const formQuery = query(collection(db, "forms"), where("id", "==", formId));
                const formSnap = await getDoc(formRef);
                if (formSnap.exists()) {
                    setFormTitle(formSnap.data().formTitle);
                }
            }
        };
        fetchSubmissions();
    }, []);

  return (
    <div className="container mt-5">
            <div className="card p-4 shadow">
                <h2 className="mb-4">{formTitle || "Form Submissions"}</h2>
                {submissions.length > 0 ? (
                    <table className="table table-striped ">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Submitted At</th>
                            </tr>
                        </thead>
                        <tbody>
                            {submissions.map((submission) => (
                                <tr key={submission.id}>
                                    <td>{submission.name}</td>
                                    <td>{submission.email}</td>
                                    <td>{format(submission.submittedAt.toDate(), "yyyy-MM-dd HH:mm")}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>No submissions available.</p>
                )}
            </div>
        </div>
  )
}

export default Submissions