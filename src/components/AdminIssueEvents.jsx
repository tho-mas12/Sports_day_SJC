import React, { useState, useEffect } from "react";
import { BookOpen, User, Users, Check, Square, CheckSquare, RefreshCw } from "lucide-react";

function AdminIssueEvents() {
  const [departments, setDepartments] = useState([]);
  const [events, setEvents] = useState([]);
  const [issuedEvents, setIssuedEvents] = useState([]);
  const [activeShift, setActiveShift] = useState(1); // 1 or 2
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Modal control states
  const [editingDept, setEditingDept] = useState(null);
  const [editingGender, setEditingGender] = useState(""); // "boys" or "girls"
  const [selectedEventIds, setSelectedEventIds] = useState([]); // Array of checked event IDs

  const loadData = async () => {
    try {
      setLoading(true);
      const deptRes = await fetch("/api/admin/departments");
      const deptData = await deptRes.json();
      
      const evRes = await fetch("/api/admin/events");
      const evData = await evRes.json();

      const issueRes = await fetch("/api/admin/issued-events");
      const issueData = await issueRes.json();

      if (deptRes.ok && evRes.ok && issueRes.ok) {
        setDepartments(deptData);
        setEvents(evData);
        setIssuedEvents(issueData);
      } else {
        setErrorMsg("Failed to load records.");
      }
    } catch (err) {
      setErrorMsg("Failed to connect to backend server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenConfig = (dept, gender) => {
    setEditingDept(dept);
    setEditingGender(gender);
    setErrorMsg("");
    setSuccessMsg("");

    // Find current issued events for this department
    const record = issuedEvents.find(r => r.department_id === dept._id);
    const currentList = record ? (record[gender] || []) : [];
    setSelectedEventIds(currentList);
  };

  const handleCheckboxToggle = (eventId) => {
    if (selectedEventIds.includes(eventId)) {
      setSelectedEventIds(selectedEventIds.filter(id => id !== eventId));
    } else {
      setSelectedEventIds([...selectedEventIds, eventId]);
    }
  };

  const handleSelectAll = (genderEvents) => {
    const genderEventIds = genderEvents.map(e => e._id);
    const allSelected = genderEventIds.every(id => selectedEventIds.includes(id));

    if (allSelected) {
      // Remove all these gender event IDs from selectedEventIds
      setSelectedEventIds(selectedEventIds.filter(id => !genderEventIds.includes(id)));
    } else {
      // Add all gender event IDs that are not already present
      const uniqueSelected = Array.from(new Set([...selectedEventIds, ...genderEventIds]));
      setSelectedEventIds(uniqueSelected);
    }
  };

  const handleSaveIssued = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    // Find current issued record for other gender so we don't overwrite it
    const record = issuedEvents.find(r => r.department_id === editingDept._id);
    const otherGender = editingGender === "boys" ? "girls" : "boys";
    const otherGenderList = record ? (record[otherGender] || []) : [];

    const payload = {
      boys: editingGender === "boys" ? selectedEventIds : otherGenderList,
      girls: editingGender === "girls" ? selectedEventIds : otherGenderList
    };

    try {
      const res = await fetch(`/api/admin/issued-events/${editingDept._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(`Issued events updated successfully for ${editingDept.name}.`);
        setEditingDept(null);
        loadData();
      } else {
        setErrorMsg(data.detail || "Failed to update issued events.");
      }
    } catch (err) {
      setErrorMsg("Connection error.");
    }
  };

  if (loading) {
    return <div style={{ padding: "40px", textAlign: "center", color: "var(--color-text-muted)" }}>Loading records...</div>;
  }

  const filteredDepts = departments.filter(d => d.shift === activeShift);
  const targetEvents = events.filter(e => e.gender === editingGender);

  return (
    <div className="animate-fade-in">
      {/* Header Banner */}
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "28px", color: "var(--color-primary)", marginBottom: "4px" }}>
          Issue Department Events
        </h1>
        <p style={{ color: "var(--color-text-muted)", fontSize: "14px" }}>
          Configure which events each department's boys and girls teams are allowed to register for
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

      {/* Grid of Department Cards */}
      <div className="event-grid">
        {filteredDepts.map(dept => {
          const record = issuedEvents.find(r => r.department_id === dept._id);
          const boysCount = record ? (record.boys || []).length : 0;
          const girlsCount = record ? (record.girls || []).length : 0;

          return (
            <div key={dept._id} className="event-card" style={{ padding: "24px" }}>
              <div style={{ marginBottom: "16px" }}>
                <span className={`event-card-badge ${dept.shift === 1 ? "badge-boys" : "badge-girls"}`}>
                  Shift {dept.shift === 1 ? "I" : "II"}
                </span>
              </div>

              <h3 style={{ fontSize: "16px", marginBottom: "4px" }}>{dept.name}</h3>
              <p style={{ fontSize: "11px", color: "var(--color-text-muted)", fontFamily: "monospace", marginBottom: "16px" }}>ID: {dept._id}</p>

              {/* Status details */}
              <div style={{ 
                backgroundColor: "#f8fafc", 
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-sm)",
                padding: "12px",
                fontSize: "12px",
                marginBottom: "20px"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  <span style={{ color: "var(--color-text-muted)" }}>Boys Events:</span>
                  <span style={{ fontWeight: 700 }}>{boysCount} issued</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--color-text-muted)" }}>Girls Events:</span>
                  <span style={{ fontWeight: 700 }}>{girlsCount} issued</span>
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "auto" }}>
                <button 
                  className="btn-secondary" 
                  style={{ flex: 1, padding: "8px", fontSize: "12px" }}
                  onClick={() => handleOpenConfig(dept, "boys")}
                >
                  Boys Events
                </button>
                <button 
                  className="btn-secondary" 
                  style={{ flex: 1, padding: "8px", fontSize: "12px" }}
                  onClick={() => handleOpenConfig(dept, "girls")}
                >
                  Girls Events
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Config Events Modal */}
      {editingDept && (
        <div className="modal-overlay" onClick={() => setEditingDept(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ width: "600px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", borderBottom: "1px solid var(--color-border)", paddingBottom: "12px" }}>
              <div>
                <h2 style={{ color: "var(--color-primary)", fontSize: "18px" }}>
                  Issue {editingGender === "boys" ? "Boys" : "Girls"} Events
                </h2>
                <p style={{ color: "var(--color-text-muted)", fontSize: "13px" }}>
                  For: {editingDept.name} (ID: {editingDept._id})
                </p>
              </div>
              <button onClick={() => setEditingDept(null)} style={{ background: "transparent", border: "none", fontSize: "20px", cursor: "pointer", color: "var(--color-text-muted)" }}>
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveIssued}>
              {/* Select All Banner */}
              <div style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center",
                backgroundColor: "#eff6ff",
                border: "1px solid #dbeafe",
                padding: "10px 16px",
                borderRadius: "var(--radius-sm)",
                marginBottom: "16px",
                cursor: "pointer"
              }}
              onClick={() => handleSelectAll(targetEvents)}
              >
                <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--color-primary)" }}>
                  Select All {editingGender === "boys" ? "Boys" : "Girls"} Events ({targetEvents.length})
                </span>
                <div>
                  {targetEvents.every(e => selectedEventIds.includes(e._id)) ? (
                    <CheckSquare size={18} color="var(--color-primary)" />
                  ) : (
                    <Square size={18} color="var(--color-primary-light)" />
                  )}
                </div>
              </div>

              {/* Event checkboxes checklist */}
              <div style={{ 
                maxHeight: "300px", 
                overflowY: "auto", 
                display: "flex", 
                flexDirection: "column", 
                gap: "10px",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-sm)",
                padding: "12px",
                marginBottom: "24px"
              }}>
                {targetEvents.length === 0 ? (
                  <p style={{ color: "var(--color-text-muted)", fontSize: "13px", textAlign: "center" }}>
                    No {editingGender} events defined in the system.
                  </p>
                ) : (
                  targetEvents.map(ev => {
                    const checked = selectedEventIds.includes(ev._id);
                    return (
                      <label 
                        key={ev._id} 
                        style={{ 
                          display: "flex", 
                          alignItems: "center", 
                          justifyContent: "space-between",
                          padding: "10px 14px",
                          borderRadius: "var(--radius-sm)",
                          backgroundColor: checked ? "#eff6ff" : "white",
                          border: `1px solid ${checked ? "#dbeafe" : "var(--color-border)"}`,
                          cursor: "pointer",
                          fontSize: "13px"
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <input 
                            type="checkbox"
                            checked={checked}
                            onChange={() => handleCheckboxToggle(ev._id)}
                            style={{ width: "16px", height: "16px" }}
                          />
                          <span style={{ fontWeight: checked ? 700 : 500 }}>{ev.name}</span>
                        </div>
                        <span className={`event-card-badge ${ev.type === 'solo' ? 'badge-solo' : 'badge-team'}`}>
                          {ev.type}
                        </span>
                      </label>
                    );
                  })
                )}
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                <button type="button" className="btn-secondary" onClick={() => setEditingDept(null)} style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                  <Check size={16} /> Save Issued Events
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminIssueEvents;
