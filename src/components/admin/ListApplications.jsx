import React, {useState, useEffect} from 'react';
import { db } from "../../utils/firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import * as XLSX from "xlsx";
import LoadingSpinner from '../../components/Shared/LoadingSpinner';

function ListApplications() {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSubmissions();
    }, []);

    const fetchSubmissions = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "form_submissions"));
            const submissionList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            setSubmissions(submissionList);
        } catch (error) {
            console.error("Error fetching submissions:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this submission?");
        if (!confirmDelete) return;

        try {
            await deleteDoc(doc(db, "form_submissions", id));
            setSubmissions(submissions.filter(submission => submission.id !== id));
        } catch (error) {
            console.error("Error deleting submission:", error);
        }
    };

    const downloadExcel = () => {
        // Define the required order of columns
        const orderedSubmissions = submissions.map(submission => ({
            Name: submission.name,
            Email: submission.email,
            Address: submission.address,
            Age: submission.age,
            Category: submission.category,
            Company: submission.company,
            Distance: submission.distance,
            Experience: submission.experience,
            "Highest Education": submission.highestEducation,
            Mark: submission.mark,
            "P-1": submission.priorityChoices?.[1],
            "P-2": submission.priorityChoices?.[2],
            "P-3": submission.priorityChoices?.[3]
        }));
    
        const worksheet = XLSX.utils.json_to_sheet(orderedSubmissions);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Submissions");
        XLSX.writeFile(workbook, "submissions.xlsx");
    };
  return (
    <div className="card m-0 p-0">
            <div className="card p-4 shadow">
                <h2 className="mb-4">Form Submissions</h2>

                {loading ? (
                    <LoadingSpinner /> // Show loading spinner while data is being fetched
                ) : submissions.length > 0 ? (
                    <>
        <div className="table-responsive">
    <table className="table table-striped  table-bordered table-hover">
        <thead className="thead-dark">
            <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Address</th>
                <th>Age</th>
                <th>Category</th>
                <th>Company</th>
                <th>Distance</th>
                <th>Experience</th>
                <th>Highest Education</th>
                <th>Mark</th>
                <th>P-1</th>
                <th>P-2</th>
                <th>P-3</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            {submissions.map((submission) => (
                <tr key={submission.id}>
                    <td>{submission.name}</td>
                    <td>{submission.email}</td>
                    <td>{submission.address}</td>
                    <td>{submission.age}</td>
                    <td>{submission.category}</td>
                    <td>{submission.company}</td>
                    <td>{submission.distance}</td>
                    <td>{submission.experience}</td>
                    <td>{submission.highestEducation}</td>
                    <td>{submission.mark}</td>
                    <td>{submission.priorityChoices?.[1] || "N/A"}</td>
                    <td>{submission.priorityChoices?.[2] || "N/A"}</td>
                    <td>{submission.priorityChoices?.[3] || "N/A"}</td>
                    <td>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(submission.id)}>
                            Delete
                        </button>
                    </td>
                </tr>
            ))}
        </tbody>
    </table>
</div>

                        <button className="btn btn-success mt-3" onClick={downloadExcel}>Download Excel</button>
                    </>
                ) : (
                    <p>No submissions available.</p>
                )}
            </div>
        </div>
  )
}

export default ListApplications