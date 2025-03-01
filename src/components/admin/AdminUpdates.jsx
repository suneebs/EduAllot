import React, { useState, useEffect } from 'react';
import LoadingSpinner from '../../components/Shared/LoadingSpinner';
import { db } from "../../utils/firebase";
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";
import 'bootstrap/dist/css/bootstrap.min.css';

function AdminUpdates() {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', important: '' });

  useEffect(() => {
    const fetchUpdates = async () => {
      try {
        setLoading(true);
        const updatesCollection = collection(db, 'updates');
        const snapshot = await getDocs(updatesCollection);
        const updatesList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        updatesList.sort((a, b) => b.createdAt - a.createdAt);
        setUpdates(updatesList);
      } catch (error) {
        console.error("Error fetching updates:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUpdates();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddNotice = async () => {
    if (window.confirm("Are you sure you want to add this notice?")) {
      try {
        const updatesCollection = collection(db, 'updates');
        await addDoc(updatesCollection, formData);
        setFormData({ title: '', description: '', important: '' });
        setShowForm(false);
        alert('Notice added successfully!');
        window.location.reload();
      } catch (error) {
        console.error("Error adding notice:", error);
      }
    }
  };

  const handleDeleteNotice = async (id) => {
    if (window.confirm("Are you sure you want to delete this notice?")) {
      if (window.confirm("This action cannot be undone. Confirm delete?")) {
        try {
          await deleteDoc(doc(db, 'updates', id));
          setUpdates(updates.filter(update => update.id !== id));
        } catch (error) {
          console.error("Error deleting notice:", error);
        }
      }
    }
  };

  return (
    <>
      <h3>Updates</h3>
      <button className="btn btn-primary mb-3" onClick={() => setShowForm(!showForm)}>
        {showForm ? 'Close Form' : 'Add Notice'}
      </button>

      {showForm && (
        <div className="card p-3 mb-4">
          <div className="mb-3">
            <label className="form-label">Title</label>
            <input
              type="text"
              className="form-control"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Description</label>
            <textarea
              className="form-control"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
            ></textarea>
          </div>
          <div className="mb-3">
            <label className="form-label">Important (highlight color)</label>
            <input
              type="text"
              className="form-control"
              name="important"
              value={formData.important}
              onChange={handleInputChange}
            />
          </div>
          <button className="btn btn-success" onClick={handleAddNotice}>Submit Notice</button>
        </div>
      )}

      {loading ? (
        <LoadingSpinner />
      ) : (
        updates.map(update => (
          <div key={update.id} className={`card mb-3 mt-4 ${update.important ? 'border-danger' : 'border-light'}`} style={{ backgroundColor: update.important ? '#f8d7da' : '#f8f9fa' }}>
            <div className="card-header d-flex justify-content-between align-items-center">
              <span>{update.title}</span>
              <button className="btn btn-sm btn-danger" onClick={() => handleDeleteNotice(update.id)}>Delete</button>
            </div>
            <div className="card-body">
              <h5 className="card-title">{update.description}</h5>
              {update.important && <span className="badge bg-danger">{update.important}</span>}
            </div>
          </div>
        ))
      )}
    </>
  );
}

export default AdminUpdates;
