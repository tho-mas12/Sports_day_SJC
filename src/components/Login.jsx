import React, { useState, useEffect } from "react";
import { KeyRound, ShieldAlert, School, CalendarDays } from "lucide-react";
import sjcLogo from "../assets/sjc_logo.jpg";

function Login({ onLogin }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState("");
  const [adminId, setAdminId] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch departments list for the dropdown
  useEffect(() => {
    fetch("http://localhost:8000/api/admin/departments")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          // Sort departments alphabetically
          const sorted = [...data].sort((a, b) => a.name.localeCompare(b.name));
          setDepartments(sorted);
          if (sorted.length > 0) {
            setSelectedDept(sorted[0]._id);
          }
        }
      })
      .catch(() => {
        setErrorMsg("Failed to load departments. Make sure backend is running.");
      });
  }, []);

  const handleToggle = () => {
    setIsAdmin(!isAdmin);
    setErrorMsg("");
    setPassword("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      if (isAdmin) {
        // Admin login
        const res = await fetch("http://localhost:8000/api/auth/login/admin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ admin_id: adminId, password })
        });
        const data = await res.json();
        if (res.ok) {
          onLogin(data);
        } else {
          setErrorMsg(data.detail || "Invalid Admin credentials.");
        }
      } else {
        // Department login
        if (!selectedDept) {
          setErrorMsg("Please select a department.");
          setLoading(false);
          return;
        }
        const res = await fetch("http://localhost:8000/api/auth/login/department", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dept_id: selectedDept, password })
        });
        const data = await res.json();
        if (res.ok) {
          onLogin(data);
        } else {
          setErrorMsg(data.detail || "Invalid login credentials.");
        }
      }
    } catch (err) {
      setErrorMsg("Connection error. Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      {/* Top right corner admin/dept toggle button */}
      <button className="admin-toggle-btn" onClick={handleToggle}>
        {isAdmin ? "Department Login" : "Admin Login"}
      </button>

      <div className="login-card animate-scale-up">
        {/* Brand/Header */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ 
            display: "inline-flex", 
            marginBottom: "16px" 
          }}>
            <img src={sjcLogo} alt="SJC Logo" style={{ width: "80px", height: "80px", borderRadius: "50%", border: "3px solid var(--color-primary-light)", objectFit: "cover" }} />
          </div>
          <h1 style={{ 
            fontSize: "24px", 
            fontWeight: 800, 
            color: "var(--color-primary)", 
            fontFamily: "var(--font-display)",
            marginBottom: "4px"
          }}>
            SJC_SPORT'S_DAY
          </h1>
          <p style={{ color: "var(--color-text-muted)", fontSize: "14px", fontWeight: 500 }}>
            {isAdmin ? "Administrator Portal" : "Department Registration Portal"}
          </p>
        </div>

        {/* Error message panel */}
        {errorMsg && (
          <div style={{ 
            padding: "14px", 
            backgroundColor: "#fef2f2", 
            color: "var(--color-danger)", 
            border: "1px solid #fee2e2", 
            borderRadius: "var(--radius-md)", 
            fontSize: "13px", 
            marginBottom: "20px",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}>
            <ShieldAlert size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          {isAdmin ? (
            // Admin Fields
            <div className="form-group">
              <label className="form-label">Admin ID</label>
              <div style={{ position: "relative" }}>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Enter admin ID"
                  value={adminId}
                  onChange={(e) => setAdminId(e.target.value)}
                  required 
                />
              </div>
            </div>
          ) : (
            // Department Selection
            <div className="form-group">
              <label className="form-label">Select Department</label>
              <select 
                className="form-select"
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                required
              >
                {departments.length === 0 ? (
                  <option value="">Loading departments...</option>
                ) : (
                  departments.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.name} ({d.shift === 1 ? "Shift I" : "Shift II"})
                    </option>
                  ))
                )}
              </select>
            </div>
          )}

          {/* Password field common to both */}
          <div className="form-group" style={{ marginBottom: "28px" }}>
            <label className="form-label">Password</label>
            <input 
              type="password" 
              className="form-input" 
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            style={{ width: "100%", padding: "14px", fontSize: "15px" }}
            disabled={loading}
          >
            <KeyRound size={18} />
            {loading ? "Logging in..." : "Access Portal"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "24px", fontSize: "11px", color: "var(--color-text-muted)" }}>
          <p>© St. Joseph's College (Autonomous)</p>
          <p>Sports Day Registration System</p>
        </div>
      </div>
    </div>
  );
}

export default Login;
