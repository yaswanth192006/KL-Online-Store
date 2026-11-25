import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

function Signup() {
  const [username, setUsername] = useState("");
  const [studentId, setStudentId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const handleSignup = (e) => {
    if (e) e.preventDefault();

    if (!username.trim() || !password.trim()) {
      setErrorMsg("All required fields must be filled!");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match!");
      return;
    }

    const users = JSON.parse(localStorage.getItem("users")) || [];

    const userExists = users.find((u) => u.username === username);
    if (userExists) {
      setErrorMsg("Username or Roll ID already registered!");
      return;
    }

    users.push({
      username: username.trim(),
      studentId: studentId.trim() || username.trim(),
      email: email.trim() || `${username}@kluniversity.in`,
      password: password.trim()
    });
    localStorage.setItem("users", JSON.stringify(users));

    alert("Registration successful! Please login with your credentials.");
    navigate("/login");
  };

  return (
    <>
      <Header />
      <div className="auth-wrapper">
        <div className="auth-card">
          <h2>Create Student Account</h2>
          <p className="auth-subtitle">Register to unlock 10% student discounts & fast hostel delivery</p>

          {errorMsg && (
            <p className="auth-error-banner">
              {errorMsg}
            </p>
          )}

          <form onSubmit={handleSignup}>
            <div className="form-group" style={{ textAlign: "left", marginBottom: "10px" }}>
              <label style={{ fontSize: "12px", fontWeight: "bold", color: "#555" }}>Student Username / Name *</label>
              <input
                type="text"
                placeholder="e.g. yaswanth192006"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ textAlign: "left", marginBottom: "10px" }}>
              <label style={{ fontSize: "12px", fontWeight: "bold", color: "#555" }}>Roll ID / Student ID</label>
              <input
                type="text"
                placeholder="e.g. 2500030520"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ textAlign: "left", marginBottom: "10px" }}>
              <label style={{ fontSize: "12px", fontWeight: "bold", color: "#555" }}>University Email</label>
              <input
                type="email"
                placeholder="e.g. 2500030520@kluniversity.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ textAlign: "left", marginBottom: "10px" }}>
              <label style={{ fontSize: "12px", fontWeight: "bold", color: "#555" }}>Password *</label>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ textAlign: "left", marginBottom: "16px" }}>
              <label style={{ fontSize: "12px", fontWeight: "bold", color: "#555" }}>Confirm Password *</label>
              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="auth-btn">
              Create Account
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in here</Link>
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Signup;
