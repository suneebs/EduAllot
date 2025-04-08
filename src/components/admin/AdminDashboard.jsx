import React, { useState, useEffect } from 'react';
import '../../pages/Home.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { db } from '../../utils/firebase';
import { getAuth, signOut } from 'firebase/auth';
import { collection, getDocs } from 'firebase/firestore';
import logo from '../../assets/logonobg.png';
import LoadingSpinner from '../../components/Shared/LoadingSpinner';
import AdminUpdates from './AdminUpdates';
import ApplicationForm from './ApplicationForm';
import ListApplications from './ListApplications';
import EditDepartment from './EditDepartment';
import PublishAllotment from './PublishAllotment';
import AllotmentList from '../user/AllotmentList';

// Dummy components for individual department allotment
const ElectricalAllotment = () => <div><h2>Electrical Allotment Page</h2></div>;
const MechanicalAllotment = () => <div><h2>Mechanical Allotment Page</h2></div>;
const ElectronicAllotment = () => <div><h2>Electronics Allotment Page</h2></div>;

function AdminDashboard() {
  const [isActive, setIsActive] = useState(false);
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeComponent, setActiveComponent] = useState('update');

  const toggleSidebar = () => {
    setIsActive(!isActive);
  };

  const handleLogout = async () => {
    const auth = getAuth();
    try {
      if (window.confirm('Do you want to log out?')) {
        await signOut(auth);
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

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
        console.error('Error fetching updates:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUpdates();
  }, []);

  return (
    <div className="wrapper">
      <nav id="sidebar" className={isActive ? 'active' : ''}>
        <div className="sidebar-header d-flex align-items-center" onClick={() => setActiveComponent('home')}>
          <img src={logo} alt="Logo" width={50} height={50} className="me-2" />
          <h4 className="p-1">EduAllot Admin</h4>
        </div>
        <ul className="list-unstyled components">
          <p onClick={() => setActiveComponent('update')}>Add Updates</p>
          <li>
            <a className="dropdown-toggle" style={{ cursor: 'pointer' }} onClick={() => setActiveComponent('apply')}>
              Release Form/Application
            </a>
          </li>
          <li>
            <a style={{ cursor: 'pointer' }} onClick={() => setActiveComponent('editdep')}>Edit Seats</a>
          </li>
          <li>
            <a style={{ cursor: 'pointer' }} onClick={() => setActiveComponent('allotmentlist')}>Download Submissions</a>
          </li>
          <li>
            {/* <a
              className="dropdown-toggle"
              data-bs-toggle="collapse"
              data-bs-target="#pageSubmenu"
              aria-expanded="false"
              aria-controls="pageSubmenu"
              style={{ cursor: 'pointer' }}
              onClick={() => setActiveComponent('allotmentlist')}
            >
              Allotment
            </a> */}
            {/* <ul className="collapse list-unstyled" id="pageSubmenu">
              <li>
                <a style={{ cursor: 'pointer' }} onClick={() => setActiveComponent('ee')}>
                  Electrical Engineering
                </a>
              </li>
              <li>
                <a style={{ cursor: 'pointer' }} onClick={() => setActiveComponent('mech')}>
                  Mechanical Engineering
                </a>
              </li>
              <li>
                <a style={{ cursor: 'pointer' }} onClick={() => setActiveComponent('ece')}>
                  Electronics Engineering
                </a>
              </li>
            </ul> */}
          </li>
          <li>
            <a className="nav-link text-danger" onClick={handleLogout} style={{ cursor: 'pointer' }}>
              Logout
            </a>
          </li>
        </ul>
      </nav>

      <div id="content">
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
          <div className="container-fluid">
            <button type="button" id="sidebarCollapse" className="btn" onClick={toggleSidebar}>
              <i className="fas fa-align-left p-1"></i>
              <span>Menu</span>
            </button>
            <div className="ms-auto">
              <ul className="navbar-nav d-flex flex-row">
                <li className="nav-item me-3">
                  <a className="nav-link" onClick={() => setActiveComponent('list')}>Submissions</a>
                </li>
                <li className="nav-item me-3">
                  <a className="nav-link" onClick={() => setActiveComponent('allot')}>Allotment</a>
                </li>
                <li className="nav-item me-1">
                  <a className="nav-link" href="#help">Help</a>
                </li>
              </ul>
            </div>
          </div>
        </nav>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            {activeComponent === 'apply' && <ApplicationForm />}
            {activeComponent === 'update' && <AdminUpdates updates={updates} />}
            {activeComponent === 'list' && <ListApplications />}
            {activeComponent === 'allot' && <PublishAllotment />}
            {activeComponent === 'editdep' && <EditDepartment />}
            {activeComponent === 'ee' && <ElectricalAllotment />}
            {activeComponent === 'mech' && <MechanicalAllotment />}
            {activeComponent === 'ece' && <ElectronicAllotment />}
          </>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
