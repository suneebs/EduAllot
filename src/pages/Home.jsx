import React, { useState, useEffect } from 'react';
import './Home.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { db } from '../utils/firebase';
import { collection, getDocs } from 'firebase/firestore';

import logo from '../assets/logonobg.png';
import LoadingSpinner from '../components/Shared/LoadingSpinner';
import ApplicationForms from '../components/user/ApplicationForms';
import Help from '../components/user/Help';
import ElectricalAllotment from '../components/user/ElectricalAllotment';
import MechanicalAllotment from '../components/user/MechanicalAllotment';
import ElectronicAllotment from '../components/user/ElectronicAllotment';

function Home({ comp }) {
  const [isActive, setIsActive] = useState(false);
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeComponent, setActiveComponent] = useState(comp || 'home');
  const [submenuOpen, setSubmenuOpen] = useState(false);

  const toggleSidebar = () => setIsActive(!isActive);

  const handleNavigation = (componentName) => {
    console.log(`Navigating to: ${componentName}`);
    setActiveComponent(componentName);
    setSubmenuOpen(false); // Close submenu if open
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
        <div className="sidebar-header d-flex align-items-center" onClick={() => handleNavigation('home')}>
          <img src={logo} alt="" width={50} height={50} className="me-2" />
          <h3 className="p-1">EduAllot</h3>
        </div>
        <ul className="list-unstyled components">
          <p style={{ cursor: 'pointer' }} onClick={() => handleNavigation('home')}>Updates</p>

          <li>
            <span style={{ cursor: 'pointer' }} onClick={() => handleNavigation('apply')}>Apply Online</span>
          </li>

          <li>
            <span
              style={{ cursor: 'pointer' }}
              className="dropdown-toggle"
              onClick={() => setSubmenuOpen(!submenuOpen)}
            >
              Allotment
            </span>
            {/* <ul className={`list-unstyled ${submenuOpen ? '' : 'd-none'} ms-3`}>
              <li><span style={{ cursor: 'pointer' }} onClick={() => handleNavigation('ee')}>Electrical</span></li>
              <li><span style={{ cursor: 'pointer' }} onClick={() => handleNavigation('mech')}>Mechanical</span></li>
              <li><span style={{ cursor: 'pointer' }} onClick={() => handleNavigation('ece')}>Electronic</span></li>
            </ul> */}
          </li>

          <li><span style={{ cursor: 'pointer' }} onClick={() => handleNavigation('help')}>Help</span></li>
        </ul>

        <div className="sidebar-footer">
          <a href="/admindashboard">
            <i className="fas fa-cog me-2"></i>
          </a>
        </div>
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
                  <span className="nav-link" style={{ cursor: 'pointer' }} onClick={() => handleNavigation('apply')}>
                    Apply Online
                  </span>
                </li>
                <li className="nav-item me-3">
                  <span className="nav-link" style={{ cursor: 'pointer' }} onClick={() => setSubmenuOpen(!submenuOpen)}>
                    Allotment
                  </span>
                </li>
                <li className="nav-item me-1">
                  <span className="nav-link" style={{ cursor: 'pointer' }} onClick={() => handleNavigation('help')}>
                    Help
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </nav>

        {/* Component Rendering */}
        {activeComponent === 'apply' && <ApplicationForms />}
        {activeComponent === 'help' && <Help />}
        {activeComponent === 'ee' && <ElectricalAllotment />}
        {activeComponent === 'mech' && <MechanicalAllotment />}
        {activeComponent === 'ece' && <ElectronicAllotment />}

        {activeComponent === 'home' && (
          <>
            <h3>Updates</h3>
            {loading ? (
              <LoadingSpinner />
            ) : (
              updates.map((update) => (
                <div
                  key={update.id}
                  className={`card mb-3 mt-4 ${update.important ? 'border-danger' : 'border-light'}`}
                  style={{ backgroundColor: update.important ? '#f8d7da' : '#f8f9fa' }}
                >
                  <div className="card-header">{update.title}</div>
                  <div className="card-body">
                    <h5 className="card-title">{update.description}</h5>
                    {update.important && <span className="badge bg-danger">{update.important}</span>}
                  </div>
                </div>
              ))
            )}
            <p>Welcome to your personalized dashboard. Here you can find quick links and statistics.</p>
          </>
        )}
      </div>
    </div>
  );
}

export default Home;
