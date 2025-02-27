import React, {useState, useEffect} from 'react';
import '../../pages/Home.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { db } from "../../utils/firebase";
import { getAuth, signOut } from "firebase/auth";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import logo from "../../assets/logonobg.png";
import LoadingSpinner from '../../components/Shared/LoadingSpinner';
import AdminUpdates from './AdminUpdates';
import ApplicationForm from './ApplicationForm';
import ListApplications from './ListApplications';
import EditDepartment from './EditDepartment';
import PublishAllotment from './PublishAllotment';

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
      if(confirm("Do you Want to Log Out")){
        await signOut(auth);
        window.location.href = '/'; // Redirect to login page or homepage
      }
      else{
        return;
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
      updatesList.sort((a, b) => b.createdAt - a.createdAt); // Sort by created date descending
      setUpdates(updatesList);
    } catch (error) {
        console.error("Error fetching updates:", error);
      } finally {
        setLoading(false); // Ensure loading is set to false regardless of success or failure
      }
    };
    fetchUpdates();
  }, []);

  
  return (
    <div className="wrapper">
      <nav id="sidebar" className={isActive ? 'active' : ''}>
        <div className="sidebar-header d-flex  align-items-center "  onClick={() => setActiveComponent("home")}>
            <img src={ logo } alt="" width={50} height={50} className='me-2' />
            <h4 className='p-1'>EduAllot Admin </h4>

     
        </div>
        <ul className="list-unstyled components">
          <p  onClick={() => setActiveComponent("update")}>Add Updates</p>
          <li className="active">
            <a  className="dropdown-toggle" onClick={() => setActiveComponent("apply")}>Release Form/Application</a>
            
           
          </li>
          <li><a  onClick={() => setActiveComponent("editdep")}>Edit Seats</a></li>
          <li><a onClick={() => setActiveComponent("list")}>Download Submissions</a></li>
           <li>
            <a href="#pageSubmenu" data-bs-toggle="collapse" aria-expanded="false" className="dropdown-toggle"  onClick={() => setActiveComponent("allot")}>Allotment</a>
            <ul className="collapse list-unstyled" id="pageSubmenu">
              <li><a href="#">Electrical Engineering</a></li>
              <li><a href="#">Mechanical Engineering</a></li>
              <li><a href="#">Electronic Engineering</a></li>
            </ul>
          </li>
          <li className="nav-item me-1">
  <a className="nav-link text-danger" onClick={handleLogout} style={{ cursor: 'pointer' }}>
    Logout
  </a>
</li>

          
          
        </ul>
        <div className="sidebar-footer" >
    
    
  </div>
      </nav>
      <div id="content">
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
          <div className="container-fluid">
            <button type="button" id="sidebarCollapse" className="btn " onClick={toggleSidebar}>
              <i className="fas fa-align-left p-1"></i>
              <span>Menu</span>
            </button>
            <div className="ms-auto">
  <ul className="navbar-nav d-flex flex-row">
    <li className="nav-item me-3">
      <a className="nav-link" onClick={() => setActiveComponent("list")}>Submissions</a>
    </li>
    <li className="nav-item me-3">
      <a className="nav-link" onClick={() => setActiveComponent("allot")}>Allotment</a>
    </li>
    <li className="nav-item me-1">
      <a className="nav-link" href="#help">Help</a>
    </li>
  </ul>
  
</div>

          </div>
        </nav>
        {activeComponent === "apply" && <ApplicationForm />}
        {activeComponent === "update" && <AdminUpdates/> }
        {activeComponent === "list" && <ListApplications/> }
        {activeComponent === "allot" && <PublishAllotment/> }
        {activeComponent === "editdep" && <EditDepartment/> }
        
        
        
      </div>
    </div>

  )
}

export default AdminDashboard