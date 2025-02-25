import React, { useState } from "react";
import { auth } from "../../utils/firebase"; // Import Firebase auth
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate(); // Navigation hook

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); // Reset error message before new attempt

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/admindashboard"); // Redirect to home after successful login
    } catch (error) {
      setError(error.message); // Show error message on failure
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
  <div className="card p-4 shadow" style={{ maxWidth: "450px", width: "100%" }}>
    <h2 className="text-center mb-4">Admin Login</h2>
    <form onSubmit={handleLogin}>
      <div className="mb-3">
        <input
          type="email"
          className="form-control"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="mb-3">
        <input
          type="password"
          className="form-control"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <button type="submit" className="btn btn-primary w-100">Log In</button>
    </form>
    {error && <p className="text-danger text-center mt-3">{error}</p>}
  </div>
</div>

  );
};

export default AdminLogin;
