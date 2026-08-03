import React, { useState, useEffect } from "react";
import Login from "./components/Login";
import sportsLogo from "./assets/sjc_logo.png";
import DepartmentDashboard from "./components/DepartmentDashboard";
import RegisterParticipant from "./components/RegisterParticipant";
import ViewParticipant from "./components/ViewParticipant";
import Profile from "./components/Profile";

// Admin components
import AdminEventsDepartments from "./components/AdminEventsDepartments";
import AdminDepartmentAccess from "./components/AdminDepartmentAccess";
import AdminDataFilters from "./components/AdminDataFilters";
import AdminRulesDeadlines from "./components/AdminRulesDeadlines";
import AdminDepartmentSecretary from "./components/AdminDepartmentSecretary";
import AdminIssueEvents from "./components/AdminIssueEvents";
import AdminActiveYear from "./components/AdminActiveYear";

import { 
  LayoutDashboard, 
  UserPlus, 
  Users, 
  User, 
  LogOut, 
  Settings, 
  Filter, 
  ShieldAlert, 
  Key, 
  BookOpen, 
  CalendarDays, 
  Layers 
} from "lucide-react";

function App() {
  const [user, setUser] = useState(() => {
    const saved = sessionStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  const [currentPage, setCurrentPage] = useState("dashboard");
  const [firstLoginDetails, setFirstLoginDetails] = useState({
    vice_name: "",
    vice_phone: "",
    student_name: "",
    student_phone: ""
  });
  const [errorMsg, setErrorMsg] = useState("");

  // Save user session
  const login = (userData) => {
    setUser(userData);
    sessionStorage.setItem("user", JSON.stringify(userData));
    setCurrentPage("dashboard");
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem("user");
    setCurrentPage("dashboard");
  };

  // First Login Secretary form submission
  const handleFirstLoginSubmit = async (e) => {
    e.preventDefault();
    if (
      !firstLoginDetails.vice_name || 
      !firstLoginDetails.vice_phone || 
      !firstLoginDetails.student_name || 
      !firstLoginDetails.student_phone
    ) {
      setErrorMsg("All fields are mandatory.");
      return;
    }

    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(firstLoginDetails.vice_phone.trim())) {
      setErrorMsg("Staff Secretary mobile number must be exactly 10 digits.");
      return;
    }
    if (!phoneRegex.test(firstLoginDetails.student_phone.trim())) {
      setErrorMsg("Student Secretary mobile number must be exactly 10 digits.");
      return;
    }

    try {
      const res = await fetch(`/api/department/${user.dept_id}/first-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(firstLoginDetails)
      });
      const data = await res.json();
      if (res.ok) {
        // Update user session state
        const updatedUser = { ...user, is_first_login: false };
        setUser(updatedUser);
        sessionStorage.setItem("user", JSON.stringify(updatedUser));
        setCurrentPage("dashboard");
        setErrorMsg("");
      } else {
        setErrorMsg(data.detail || "Failed to save details.");
      }
    } catch (err) {
      setErrorMsg("Failed to connect to server.");
    }
  };

  // If not logged in, render Login page
  if (!user) {
    return <Login onLogin={login} />;
  }

  // If logged in as Department, but first login: show mandatory Secretary Form
  if (user.role === "department" && user.is_first_login) {
    return (
      <div className="login-wrapper">
        <div className="login-card animate-fade-in" style={{ width: "500px" }}>
          <h2 style={{ marginBottom: "12px", color: "var(--color-primary)", fontFamily: "var(--font-display)" }}>
            Welcome, {user.name}
          </h2>
          <p style={{ color: "var(--color-text-muted)", fontSize: "14px", marginBottom: "24px" }}>
            This is your first login. Please enter the details of the Staff Secretary and Student Secretary to unlock the dashboard.
          </p>

          {errorMsg && (
            <div style={{ padding: "12px", backgroundColor: "#fef2f2", color: "var(--color-danger)", border: "1px solid #fee2e2", borderRadius: "var(--radius-md)", fontSize: "13px", marginBottom: "16px", fontWeight: 600 }}>
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleFirstLoginSubmit}>
            <h4 style={{ fontSize: "13px", color: "var(--color-primary-light)", marginBottom: "12px", borderBottom: "1px solid var(--color-border)", paddingBottom: "6px" }}>
              Staff Secretary Details
            </h4>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Enter Staff Secretary Name"
                value={firstLoginDetails.vice_name}
                onChange={e => setFirstLoginDetails({...firstLoginDetails, vice_name: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Mobile Number</label>
              <input 
                type="tel" 
                className="form-input" 
                placeholder="Enter 10-digit mobile number"
                value={firstLoginDetails.vice_phone}
                onChange={e => setFirstLoginDetails({...firstLoginDetails, vice_phone: e.target.value.replace(/\D/g, "")})}
                maxLength={10}
                required
              />
            </div>

            <h4 style={{ fontSize: "13px", color: "var(--color-primary-light)", marginTop: "24px", marginBottom: "12px", borderBottom: "1px solid var(--color-border)", paddingBottom: "6px" }}>
              Student Secretary Details
            </h4>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Enter Student Secretary Name"
                value={firstLoginDetails.student_name}
                onChange={e => setFirstLoginDetails({...firstLoginDetails, student_name: e.target.value})}
                required
              />
            </div>
            <div className="form-group" style={{ marginBottom: "28px" }}>
              <label className="form-label">Mobile Number</label>
              <input 
                type="tel" 
                className="form-input" 
                placeholder="Enter 10-digit mobile number"
                value={firstLoginDetails.student_phone}
                onChange={e => setFirstLoginDetails({...firstLoginDetails, student_phone: e.target.value.replace(/\D/g, "")})}
                maxLength={10}
                required
              />
            </div>

            <button type="submit" className="btn-primary" style={{ width: "100%", padding: "14px" }}>
              Submit & Unlock Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Normal dashboard view
  return (
    <div className="app-container">
      {/* Left side persistent Navigation Bar */}
      <nav className="sidebar">
        <div className="sidebar-brand">
          <img src={sportsLogo} alt="SJC Sports Logo" style={{ width: "32px", height: "32px", objectFit: "contain", marginRight: "8px" }} />
          <span>SJC_SPORT'S_DAY</span>
        </div>

        {user.role === "department" ? (
          // Department Sidebar
          <ul className="sidebar-menu">
            <li>
              <button 
                onClick={() => setCurrentPage("dashboard")} 
                className={`sidebar-item-btn ${currentPage === "dashboard" ? "active" : ""}`}
              >
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </button>
            </li>
            <li>
              <button 
                onClick={() => setCurrentPage("register")} 
                className={`sidebar-item-btn ${currentPage === "register" ? "active" : ""}`}
              >
                <UserPlus size={18} />
                <span>Register Participant</span>
              </button>
            </li>
            <li>
              <button 
                onClick={() => setCurrentPage("view")} 
                className={`sidebar-item-btn ${currentPage === "view" ? "active" : ""}`}
              >
                <Users size={18} />
                <span>View Registrations</span>
              </button>
            </li>
            <li>
              <button 
                onClick={() => setCurrentPage("profile")} 
                className={`sidebar-item-btn ${currentPage === "profile" ? "active" : ""}`}
              >
                <User size={18} />
                <span>Department Profile</span>
              </button>
            </li>
          </ul>
        ) : (
          // Admin Sidebar
          <ul className="sidebar-menu">
            <li>
              <button 
                onClick={() => setCurrentPage("admin_active_year")} 
                className={`sidebar-item-btn ${currentPage === "admin_active_year" ? "active" : ""}`}
              >
                <CalendarDays size={18} />
                <span>Active Year</span>
              </button>
            </li>
            <li>
              <button 
                onClick={() => setCurrentPage("admin_events_depts")} 
                className={`sidebar-item-btn ${currentPage === "admin_events_depts" ? "active" : ""}`}
              >
                <Layers size={18} />
                <span>Events & Depts</span>
              </button>
            </li>
            <li>
              <button 
                onClick={() => setCurrentPage("admin_dept_access")} 
                className={`sidebar-item-btn ${currentPage === "admin_dept_access" ? "active" : ""}`}
              >
                <Key size={18} />
                <span>Department Access</span>
              </button>
            </li>
            <li>
              <button 
                onClick={() => setCurrentPage("admin_data_filters")} 
                className={`sidebar-item-btn ${currentPage === "admin_data_filters" ? "active" : ""}`}
              >
                <Filter size={18} />
                <span>Data Filters</span>
              </button>
            </li>
            <li>
              <button 
                onClick={() => setCurrentPage("admin_rules_deadlines")} 
                className={`sidebar-item-btn ${currentPage === "admin_rules_deadlines" ? "active" : ""}`}
              >
                <ShieldAlert size={18} />
                <span>Rules & Deadlines</span>
              </button>
            </li>
            <li>
              <button 
                onClick={() => setCurrentPage("admin_dept_secretary")} 
                className={`sidebar-item-btn ${currentPage === "admin_dept_secretary" ? "active" : ""}`}
              >
                <Users size={18} />
                <span>Dept. Secretary</span>
              </button>
            </li>
            <li>
              <button 
                onClick={() => setCurrentPage("admin_issue_events")} 
                className={`sidebar-item-btn ${currentPage === "admin_issue_events" ? "active" : ""}`}
              >
                <BookOpen size={18} />
                <span>Issue Dep_events</span>
              </button>
            </li>
          </ul>
        )}

        {/* Sidebar Footer - User details & Logout */}
        <div style={{ marginTop: "auto", padding: "12px 12px 0 12px", borderTop: "1px solid var(--color-border)" }}>
          <div style={{ marginBottom: "12px" }}>
            <p style={{ fontSize: "11px", color: "var(--color-text-muted)", fontWeight: 700, textTransform: "uppercase" }}>
              Logged in as
            </p>
            <p style={{ fontSize: "13px", fontWeight: 700, color: "var(--color-text-dark)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {user.name}
            </p>
          </div>
          <button onClick={logout} className="sidebar-item-btn sidebar-logout-btn">
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </nav>

      {/* Main Page Area */}
      <main className="main-content">
        {/* Render pages dynamically based on current page selection */}
        {user.role === "department" ? (
          <>
            {currentPage === "dashboard" && <DepartmentDashboard onNavigate={setCurrentPage} user={user} />}
            {currentPage === "register" && <RegisterParticipant user={user} onNavigate={setCurrentPage} />}
            {currentPage === "view" && <ViewParticipant user={user} />}
            {currentPage === "profile" && <Profile user={user} />}
          </>
        ) : (
          <>
            {currentPage === "dashboard" && <AdminEventsDepartments />}
            {currentPage === "admin_events_depts" && <AdminEventsDepartments />}
            {currentPage === "admin_active_year" && <AdminActiveYear />}
            {currentPage === "admin_dept_access" && <AdminDepartmentAccess />}
            {currentPage === "admin_data_filters" && <AdminDataFilters />}
            {currentPage === "admin_rules_deadlines" && <AdminRulesDeadlines />}
            {currentPage === "admin_dept_secretary" && <AdminDepartmentSecretary />}
            {currentPage === "admin_issue_events" && <AdminIssueEvents />}
          </>
        )}
      </main>
    </div>
  );
}

export default App;
