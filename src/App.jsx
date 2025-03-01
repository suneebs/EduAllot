import React, { Suspense, useState }  from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import NotFound from "./pages/NotFound"; 
import LoadingSpinner from "./components/Shared/LoadingSpinner";
import AdminLogin from './components/admin/AdminLogin';
import SecureAuthRoutes from './utils/SecureAuthRoutes';
import AdminDashboard from './components/admin/AdminDashboard';



const Home = React.lazy(() => import("./pages/Home"));

function App() {
  
  return (
    <Router>
            <Suspense fallback={<LoadingSpinner />}>
                <Routes>
                    
                    <Route path="/" element={<Home />} />
                    <Route path="/apply" element={<Home comp="apply" />} />




                    {/* Public Routes */}
                    
                    <Route path="/admincet" element={<AdminLogin />} />
                    

                    {/* Protected Routes (Admin) */}
                    <Route element={<SecureAuthRoutes />}>
                    <Route path="/admindashboard" element={<AdminDashboard />} />
                    </Route>

                    {/* Not Found Route */}
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </Suspense>
        </Router>
  )
}

export default App