import React, { Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import SecureAuthRoutes from "./utils/SecureAuthRoutes"; // Auth Middleware
import NotFound from "./pages/NotFound"; // 404 Page
import LoadingSpinner from "./components/Shared/LoadingSpinner"; // Loader Component

// Lazy load components for efficiency
const Home = React.lazy(() => import("./pages/Home"));
const AdminLogin = React.lazy(() => import("./components/admin/AdminLogin"));


// Admin Pages
const AdminDashboard = React.lazy(() => import("./components/admin/AdminDashboard"));


// User Pages
const User = React.lazy(() => import("./components/user/User"));


function App() {


    return (
        <Router>
            <Suspense fallback={<LoadingSpinner />}>
                <Routes>
                    {/* Redirect '/' to '/home' */}
                    {/* <Route path="/" element={<Navigate to="/home" replace />} /> */}
                    <Route path="/" element={<Home />} />

                    {/* Public Routes */}
                    <Route path="/home" element={<User />} />
                    <Route path="/adminlogin2025" element={<AdminLogin />} />
                    

                    {/* Protected Routes (Admin) */}
                    <Route element={<SecureAuthRoutes />}>
                    <Route path="/admindashboard" element={<AdminDashboard />} />
                    </Route>

                    {/* Not Found Route */}
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </Suspense>
        </Router>
    );
}

export default App;
