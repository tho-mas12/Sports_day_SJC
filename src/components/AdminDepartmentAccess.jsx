import React, { useState, useEffect } from "react";
import { Key, ShieldCheck, ShieldAlert, Check } from "lucide-react";

function AdminDepartmentAccess() {
  const [departments, setDepartments] = useState([]);
  const [activeShift, setActiveShift] = useState(1); // 1 or 2
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  
  // Modal states
  const [selectedDept, setSelectedDept] = useState(null);
  const [password, setPassword] = useState("");

  const loadDepartments = () => {
    setLoading(true);
    fetch("/api/admin/departments")
      .then(res => {
        if (!res.ok) throw new Error("Failed to load departments");
        return res.json();
      })
      .then(data => {
        setDepartments(data);
        setLoading(false);
      })
      .catch(err => {
        setErrorMsg("Failed to load departments list.");
        setLoading(false);
      });
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  const handleAccessClick = (dept) => {
    setSelectedDept(dept);
    setPassword(dept.password || ""); // load existing password if any
    setErrorMsg("");
    setSuccessMsg("");
  };

  const handleAccessSubmit = async (e) => {
    e.preventDefault();
    if (!password.trim()) {
      setErrorMsg("Password cannot be blank.");
      return;
    }

    try {
      const res = await fetch(`/api/admin/department-access/${selectedDept._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: password.trim() })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(`Access granted/updated successfully for ${selectedDept.name}.`);
        setSelectedDept(null);
        loadDepartments();
      } else {
        setErrorMsg(data.detail || "Failed to update access password.");
      }
    } catch (err) {
      setErrorMsg("Connection error.");
    }
  };

  if (loading) {
    return <div style={{ padding: "40px", textAlign: "center", color: "var(--color-text-muted)" }}>Loading departments...</div>;
  }

  const filteredDepts = departments.filter(d => d.shift === activeShift);

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "28px", color: "var(--color-primary)", marginBottom: "4px" }}>
          Department Access
        </h1>
        <p style={{ color: "var(--color-text-muted)", fontSize: "14px" }}>
          Generate login credentials and manage access passwords for collegiate departments
        </p>
      </div>

      {/* Tabs list */}
      <div className="tab-container">
        <button 
          className={`tab-btn ${activeShift === 1 ? "active" : ""}`}
          onClick={() => { setActiveShift(1); setErrorMsg(""); setSuccessMsg(""); }}
        >
          Shift I Teams
        </button>
        <button 
          className={`tab-btn ${activeShift === 2 ? "active" : ""}`}
          onClick={() => { setActiveShift(2); setErrorMsg(""); setSuccessMsg(""); }}
        >
          Shift II Teams
        </button>
      </div>

      {errorMsg && (
        <div style={{ padding: "14px", backgroundColor: "#fef2f2", color: "var(--color-danger)", border: "1px solid #fee2e2", borderRadius: "var(--radius-md)", fontSize: "14px", marginBottom: "24px", fontWeight: 600 }}>
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div style={{ padding: "14px", backgroundColor: "#f0fdf4", color: "var(--color-success)", border: "1px solid #dcfce7", borderRadius: "var(--radius-md)", fontSize: "14px", marginBottom: "24px", fontWeight: 600 }}>
          {successMsg}
        </div>
      )}

      {/* Grid of Departments */}
      <div className="event-grid">
        {filteredDepts.map(dept => {
          const hasAccess = !!dept.password;
          return (
            <div key={dept._id} className="event-card" style={{ padding: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                <span className={`event-card-badge ${dept.shift === 1 ? "badge-boys" : "badge-girls"}`}>
                  Shift {dept.shift === 1 ? "I" : "II"}
                </span>
                
                <span style={{ 
                  fontSize: "11px", 
                  fontWeight: 700, 
                  color: hasAccess ? "var(--color-success)" : "var(--color-warning)",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px"
                }}>
                  {hasAccess ? (
                    <>
                      <ShieldCheck size={14} /> Active
                    </>
                  ) : (
                    <>
                      <ShieldAlert size={14} /> No Access
                    </>
                  )}
                </span>
              </div>

              <h3 style={{ fontSize: "16px", marginBottom: "4px" }}>{dept.name}</h3>
              <p style={{ fontSize: "11px", color: "var(--color-text-muted)", fontFamily: "monospace", marginBottom: "12px" }}>ID: {dept._id}</p>
              
              {hasAccess && (
                <div style={{ 
                  backgroundColor: "#f8fafc", 
                  padding: "8px 12px", 
                  borderRadius: "var(--radius-sm)", 
                  fontSize: "12px",
                  border: "1px solid var(--color-border)",
                  marginBottom: "20px"
                }}>
                  <span style={{ color: "var(--color-text-muted)" }}>Password: </span>
                  <span style={{ fontWeight: 700, fontFamily: "monospace" }}>{dept.password}</span>
                </div>
              )}

              <button 
                className={hasAccess ? "btn-secondary" : "btn-primary"} 
                style={{ width: "100%", marginTop: "auto" }}
                onClick={() => handleAccessClick(dept)}
              >
                <Key size={14} />
                {hasAccess ? "Edit Password" : "Give Access"}
              </button>
            </div>
          );
        })}
      </div>

      {/* Give Access Modal */}
      {selectedDept && (
        <div className="modal-overlay" onClick={() => setSelectedDept(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ width: "450px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "1px solid var(--color-border)", paddingBottom: "12px" }}>
              <h2 style={{ color: "var(--color-primary)", fontSize: "18px" }}>
                Configure Department Access
              </h2>
              <button onClick={() => setSelectedDept(null)} style={{ background: "transparent", border: "none", fontSize: "20px", cursor: "pointer", color: "var(--color-text-muted)" }}>
                &times;
              </button>
            </div>

            <form onSubmit={handleAccessSubmit}>
              <div className="form-group">
                <label className="form-label">Department Name</label>
                <input type="text" className="form-input" value={selectedDept.name} disabled />
              </div>
              
              <div className="form-group">
                <label className="form-label">Department ID</label>
                <input type="text" className="form-input" value={selectedDept._id} disabled />
              </div>

              <div className="form-group" style={{ marginBottom: "24px" }}>
                <label className="form-label">Set Login Password</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Enter login password" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required 
                />
                <span style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>
                  This password will be used along with the Department ID for logging in.
                </span>
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                <button type="button" className="btn-secondary" onClick={() => setSelectedDept(null)} style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                  <Check size={16} /> Save & Grant Access
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDepartmentAccess;
