import React, { Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import NotFound from "./pages/NotFound";
import LoadingSpinner from "./components/Shared/LoadingSpinner";
import AdminLogin from "./components/admin/AdminLogin";
import SecureAuthRoutes from "./utils/SecureAuthRoutes";
import AdminDashboard from "./components/admin/AdminDashboard";

const Home = React.lazy(() => import("./pages/Home"));
const PublishAllotment = React.lazy(() => import("./components/admin/PublishAllotment"));
const AllotmentResults = React.lazy(() => import("./components/admin/AllotmentResults"));

function App() {
  return (
    <Router>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/apply" element={<Home comp="apply" />} />
          <Route path="/admincet" element={<AdminLogin />} />

          {/* Protected Routes (Admin) */}
          <Route element={<SecureAuthRoutes />}>
            <Route path="/admindashboard" element={<AdminDashboard />} />
            <Route path="/publish-allotment" element={<PublishAllotment />} />
            <Route path="/allotment-results" element={<AllotmentResults />} />
          </Route>

          {/* Not Found Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
