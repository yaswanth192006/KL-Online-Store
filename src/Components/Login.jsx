import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import { CartContext } from "../context/CartContext";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const { loginUser } = useContext(CartContext);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    if (e) e.preventDefault();

    const cleanUser = username.trim();
    const cleanPass = password.trim();

    if (!cleanUser || !cleanPass) {
      setErrorMsg("Please enter both username and password");
      return;
    }

    // Merchant Login
    if (cleanUser === "Merchant" && cleanPass === "Admin123") {
      loginUser("Merchant", "MERCHANT-01", "store@kluniversity.in", "merchant");
      navigate("/merchant");
      return;
    }

    const users = JSON.parse(localStorage.getItem("users")) || [];
    const matchedRegistered = users.find(
      (u) => u.username === cleanUser && u.password === cleanPass
    );

    if (matchedRegistered) {
      loginUser(
        matchedRegistered.username,
        matchedRegistered.studentId || matchedRegistered.username,
        matchedRegistered.email || `${matchedRegistered.username}@kluniversity.in`,
        "student"
      );
      navigate("/products");
      return;
    }

    const defaultStudentProfiles = {
      yaswanth192006: { id: "2500030520", email: "2500030520@kluniversity.in" },
      "2500030520": { id: "2500030520", email: "2500030520@kluniversity.in" },
      student: { id: "STU-1001", email: "student@kluniversity.in" },
      Monu: { id: "STU-1002", email: "monu@kluniversity.in" }
    };

    if (defaultStudentProfiles[cleanUser] && cleanPass === "123") {
      const prof = defaultStudentProfiles[cleanUser];
      loginUser(cleanUser, prof.id, prof.email, "student");
      navigate("/products");
    } else {
      setErrorMsg("Invalid username or password.");
    }
  };

  return (
    <>
      <Header />
      <div className="auth-wrapper">
        <div className="auth-card">
          <h2>Portal Login</h2>
          <p className="auth-subtitle">Sign in with your KL University Student or Merchant account</p>

          {errorMsg && (
            <p className="auth-error-banner">
              {errorMsg}
            </p>
          )}

          <form onSubmit={handleLogin}>
            <div className="form-group" style={{ textAlign: "left", marginBottom: "12px" }}>
              <label style={{ fontSize: "12px", fontWeight: "bold", color: "#555" }}>Username / Roll ID</label>
              <input
                type="text"
                placeholder="Enter username or Roll ID"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setErrorMsg("");
                }}
                required
              />
            </div>

            <div className="form-group" style={{ textAlign: "left", marginBottom: "16px" }}>
              <label style={{ fontSize: "12px", fontWeight: "bold", color: "#555" }}>Password</label>
              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrorMsg("");
                }}
                required
              />
            </div>

            <button type="submit" className="auth-btn">
              Sign In
            </button>
          </form>

          <p className="auth-switch">
            New student? <Link to="/signup">Register Account</Link>
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Login;
