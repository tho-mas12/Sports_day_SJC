import React, { useState, useEffect } from "react";
import { Loader2, Search, CheckCircle2, AlertCircle, FileText, ChevronDown, ChevronUp } from "lucide-react";
import CustomPopup from "./CustomPopup";

function AdminRegisteredDepartments() {
  const [auditData, setAuditData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all"); // "all", "boys", "girls"
  const [expandedEventId, setExpandedEventId] = useState(null);

  // Custom Popup State
  const [popup, setPopup] = useState({
    isOpen: false,
    type: "success",
    title: "",
    message: ""
  });

  const loadAuditData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/reports/registrations-audit");
      const data = await res.json();
      if (res.ok) {
        setAuditData(data || []);
      } else {
        setPopup({
          isOpen: true,
          type: "danger",
          title: "Error",
          message: "Failed to load registrations audit report."
        });
      }
    } catch (err) {
      setPopup({
        isOpen: true,
        type: "danger",
        title: "Connection Error",
        message: "Failed to connect to backend server."
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuditData();
  }, []);

  const toggleExpand = (eventId) => {
    setExpandedEventId(expandedEventId === eventId ? null : eventId);
  };

  // Filter audit data
  const filteredEvents = auditData.filter(item => {
    const matchesSearch = item.event_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === "all" || item.category === activeTab;
    return matchesSearch && matchesTab;
  });

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "var(--color-text-muted)" }}>
        <Loader2 className="animate-spin" style={{ display: "inline-block", marginRight: "8px" }} />
        Loading registrations audit...
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: "32px", display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "28px", color: "var(--color-primary)", marginBottom: "4px" }}>
            Registered Departments by Event
          </h1>
          <p style={{ color: "var(--color-text-muted)", fontSize: "14px" }}>
            Audit which departments have completed or missed registrations for each individual sports event.
          </p>
        </div>
      </div>

      {/* Tabs and Search Bar */}
      <div className="card" style={{ marginBottom: "24px", padding: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          
          {/* Tab buttons */}
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={() => setActiveTab("all")}
              className={`tab-btn ${activeTab === "all" ? "active" : ""}`}
              style={{
                padding: "8px 16px",
                borderRadius: "var(--radius-sm)",
                fontWeight: 600,
                fontSize: "14px",
                border: "none",
                backgroundColor: activeTab === "all" ? "var(--color-primary)" : "transparent",
                color: activeTab === "all" ? "white" : "var(--color-text-muted)",
                cursor: "pointer"
              }}
            >
              All Events ({auditData.length})
            </button>
            <button
              onClick={() => setActiveTab("boys")}
              className={`tab-btn ${activeTab === "boys" ? "active" : ""}`}
              style={{
                padding: "8px 16px",
                borderRadius: "var(--radius-sm)",
                fontWeight: 600,
                fontSize: "14px",
                border: "none",
                backgroundColor: activeTab === "boys" ? "var(--color-primary)" : "transparent",
                color: activeTab === "boys" ? "white" : "var(--color-text-muted)",
                cursor: "pointer"
              }}
            >
              Boys' Events ({auditData.filter(e => e.category !== "girls").length})
            </button>
            <button
              onClick={() => setActiveTab("girls")}
              className={`tab-btn ${activeTab === "girls" ? "active" : ""}`}
              style={{
                padding: "8px 16px",
                borderRadius: "var(--radius-sm)",
                fontWeight: 600,
                fontSize: "14px",
                border: "none",
                backgroundColor: activeTab === "girls" ? "var(--color-primary)" : "transparent",
                color: activeTab === "girls" ? "white" : "var(--color-text-muted)",
                cursor: "pointer"
              }}
            >
              Girls' Events ({auditData.filter(e => e.category === "girls").length})
            </button>
          </div>

          {/* Search bar */}
          <div style={{ position: "relative", minWidth: "260px" }}>
            <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)" }}>
              <Search size={16} />
            </span>
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: "36px", margin: 0, height: "38px" }}
              placeholder="Search event name..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Events List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {filteredEvents.length === 0 ? (
          <div className="card" style={{ padding: "40px", textAlign: "center", color: "var(--color-text-muted)" }}>
            No matching events found.
          </div>
        ) : (
          filteredEvents.map(item => {
            const isExpanded = expandedEventId === item.event_id;
            const totalCount = item.registered.length + item.not_registered.length;
            const regCount = item.registered.length;
            const percentage = totalCount > 0 ? Math.round((regCount / totalCount) * 100) : 0;

            return (
              <div 
                key={item.event_id} 
                className="card" 
                style={{ 
                  padding: "0", 
                  overflow: "hidden",
                  borderLeft: `5px solid ${item.category === "girls" ? "#d946ef" : "var(--color-primary)"}`,
                  boxShadow: isExpanded ? "0 4px 20px rgba(0, 0, 0, 0.08)" : "var(--shadow-sm)"
                }}
              >
                {/* Event header row (Clickable) */}
                <div 
                  onClick={() => toggleExpand(item.event_id)}
                  style={{ 
                    padding: "20px 24px", 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "center", 
                    cursor: "pointer",
                    backgroundColor: isExpanded ? "#f8fafc" : "transparent"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <div>
                      <h3 style={{ fontSize: "16px", fontWeight: 700, margin: 0, color: "var(--color-text-dark)" }}>
                        {item.event_name}
                      </h3>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                        <span style={{ 
                          fontSize: "11px", 
                          fontWeight: 700, 
                          textTransform: "uppercase",
                          padding: "2px 8px", 
                          borderRadius: "100px", 
                          backgroundColor: item.category === "girls" ? "#fdf4ff" : "#eff6ff", 
                          color: item.category === "girls" ? "#c026d3" : "var(--color-primary)" 
                        }}>
                          {item.category === "girls" ? "Girls Division" : "Boys Division"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
                    {/* Progress Bar Info */}
                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--color-text-dark)" }}>
                        Registered: {regCount} / {totalCount}
                      </span>
                      <div style={{ width: "120px", height: "6px", backgroundColor: "#e2e8f0", borderRadius: "100px", marginTop: "6px", overflow: "hidden" }}>
                        <div style={{ 
                          width: `${percentage}%`, 
                          height: "100%", 
                          backgroundColor: percentage === 100 ? "#22c55e" : percentage > 50 ? "#3b82f6" : "#f59e0b",
                          borderRadius: "100px"
                        }} />
                      </div>
                    </div>

                    {/* Expand/Collapse Chevron */}
                    <div style={{ color: "var(--color-text-muted)" }}>
                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                  </div>
                </div>

                {/* Expanded Details Panel */}
                {isExpanded && (
                  <div style={{ 
                    padding: "24px", 
                    borderTop: "1px solid var(--color-border)",
                    backgroundColor: "#fafafa" 
                  }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                      
                      {/* Registered column */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", borderBottom: "2px solid #22c55e", paddingBottom: "8px" }}>
                          <CheckCircle2 size={18} style={{ color: "#22c55e" }} />
                          <h4 style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "#166534" }}>
                            Registered ({item.registered.length})
                          </h4>
                        </div>
                        {item.registered.length === 0 ? (
                          <p style={{ color: "var(--color-text-muted)", fontSize: "13px", margin: "8px 0" }}>
                            No departments have registered for this event yet.
                          </p>
                        ) : (
                          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            {item.registered.map(dept => (
                              <div 
                                key={dept.id} 
                                style={{ 
                                  padding: "10px 12px", 
                                  backgroundColor: "#f0fdf4", 
                                  border: "1px solid #bbf7d0", 
                                  borderRadius: "var(--radius-sm)",
                                  fontSize: "13px",
                                  color: "#166534",
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center"
                                }}
                              >
                                <span style={{ fontWeight: 600 }}>{dept.name}</span>
                                <span style={{ fontSize: "10px", fontWeight: 700, backgroundColor: "#dcfce7", padding: "2px 6px", borderRadius: "4px" }}>
                                  Shift {dept.shift === 3 ? "I & II" : dept.shift}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Not Registered column */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", borderBottom: "2px solid #ef4444", paddingBottom: "8px" }}>
                          <AlertCircle size={18} style={{ color: "#ef4444" }} />
                          <h4 style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "#991b1b" }}>
                            Not Registered ({item.not_registered.length})
                          </h4>
                        </div>
                        {item.not_registered.length === 0 ? (
                          <p style={{ color: "var(--color-text-muted)", fontSize: "13px", margin: "8px 0" }}>
                            All eligible departments have completed registration! 🎉
                          </p>
                        ) : (
                          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            {item.not_registered.map(dept => (
                              <div 
                                key={dept.id} 
                                style={{ 
                                  padding: "10px 12px", 
                                  backgroundColor: "#fef2f2", 
                                  border: "1px solid #fecaca", 
                                  borderRadius: "var(--radius-sm)",
                                  fontSize: "13px",
                                  color: "#991b1b",
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center"
                                }}
                              >
                                <span style={{ fontWeight: 600 }}>{dept.name}</span>
                                <span style={{ fontSize: "10px", fontWeight: 700, backgroundColor: "#fee2e2", padding: "2px 6px", borderRadius: "4px" }}>
                                  Shift {dept.shift === 3 ? "I & II" : dept.shift}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <CustomPopup 
        isOpen={popup.isOpen}
        type={popup.type}
        title={popup.title}
        message={popup.message}
        onClose={() => setPopup({ ...popup, isOpen: false })}
      />
    </div>
  );
}

export default AdminRegisteredDepartments;
