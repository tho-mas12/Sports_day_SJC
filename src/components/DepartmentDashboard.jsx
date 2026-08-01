import React, { useState, useEffect } from "react";
import { BookOpen, AlertCircle, Clock, Trophy, Users, CheckCircle, HelpCircle } from "lucide-react";

function DepartmentDashboard({ onNavigate, user }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [showRules, setShowRules] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");

  // Fetch dashboard data
  useEffect(() => {
    fetch(`/api/department/${user.dept_id}/dashboard`)
      .then(res => {
        if (!res.ok) throw new Error("Failed to load dashboard data");
        return res.json();
      })
      .then(resData => {
        setData(resData);
        setLoading(false);
      })
      .catch(err => {
        setErrorMsg("Failed to load dashboard data.");
        setLoading(false);
      });
  }, [user.dept_id]);

  // Countdown timer logic
  useEffect(() => {
    if (!data) return;

    // Get applicable deadline (check for any specific event deadline or common deadline)
    const deadlineStr = data.common_deadline;
    if (!deadlineStr) {
      setTimeLeft("No active deadline");
      return;
    }

    const interval = setInterval(() => {
      const diff = new Date(deadlineStr) - new Date();
      if (diff <= 0) {
        setTimeLeft("REGISTRATION CLOSED");
        clearInterval(interval);
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / 1000 / 60) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        
        let display = "";
        if (days > 0) display += `${days}d `;
        display += `${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
        setTimeLeft(display);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [data]);

  const getEventDeadline = (eventId) => {
    if (data && data.event_deadlines && data.event_deadlines[eventId]) {
      return data.event_deadlines[eventId];
    }
    return data ? data.common_deadline : null;
  };

  const formatEventDeadline = (eventId) => {
    const dl = getEventDeadline(eventId);
    if (!dl) return "No deadline set";
    return new Date(dl).toLocaleString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return <div style={{ padding: "40px", textAlign: "center", color: "var(--color-text-muted)" }}>Loading Dashboard...</div>;
  }

  if (errorMsg) {
    return <div style={{ padding: "40px", color: "var(--color-danger)" }}>{errorMsg}</div>;
  }

  return (
    <div className="animate-fade-in">
      {/* Red Announcement Marquee Banner */}
      {data.notification && (
        <div className="announcement-bar animate-fade-in">
          <div className="marquee-container">
            <span className="marquee-text">{data.notification}</span>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <div>
          <h1 style={{ fontSize: "28px", color: "var(--color-primary)", marginBottom: "4px" }}>
            {data.dept_name} Dashboard
          </h1>
          <p style={{ color: "var(--color-text-muted)", fontSize: "14px" }}>
            Shift {data.shift === 1 ? "I" : "II"} • Sports Day Registration Portal
          </p>
        </div>
        
        <div style={{ display: "flex", gap: "12px" }}>
          <button className="btn-secondary rules-btn-pulse" onClick={() => setShowRules(true)}>
            <BookOpen size={16} />
            View Rules
          </button>
          <button className="btn-primary" onClick={() => onNavigate("register")}>
            <Trophy size={16} />
            Register Participant
          </button>
        </div>
      </div>

      {/* Deadline box & Countdown */}
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "space-between", 
        backgroundColor: "#eff6ff", 
        border: "1px solid #dbeafe",
        padding: "20px 24px",
        borderRadius: "var(--radius-md)",
        marginBottom: "32px",
        boxShadow: "var(--shadow-sm)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ backgroundColor: "#3b82f6", padding: "12px", borderRadius: "var(--radius-md)", color: "white" }}>
            <Clock size={24} />
          </div>
          <div>
            <h4 style={{ fontSize: "15px", color: "var(--color-primary)" }}>Registration Deadline</h4>
            <p style={{ color: "var(--color-text-muted)", fontSize: "13px" }}>
              {data.common_deadline ? new Date(data.common_deadline).toLocaleString('en-US', {
                hour: 'numeric',
                minute: 'numeric',
                hour12: true,
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
              }) : "Not Set"}
            </p>
          </div>
        </div>
        
        <div style={{ textAlign: "right" }}>
          <p style={{ fontSize: "11px", fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>Time Remaining</p>
          <h2 style={{ 
            fontSize: "24px", 
            color: timeLeft.includes("CLOSED") ? "var(--color-danger)" : "var(--color-primary-light)",
            fontFamily: "var(--font-display)",
            fontWeight: 800
          }}>
            {timeLeft}
          </h2>
        </div>
      </div>

      {/* Grid: Metrics Row */}
      <div className="stat-grid">
        <div className="stat-box" style={{ borderLeftColor: "#3b82f6" }}>
          <div>
            <p style={{ fontSize: "13px", color: "var(--color-text-muted)", fontWeight: 700 }}>EVENTS ALLOWED</p>
            <h3 className="stat-value">{data.allowed_count}</h3>
          </div>
          <Trophy size={32} color="#3b82f6" style={{ opacity: 0.8 }} />
        </div>
        <div className="stat-box" style={{ borderLeftColor: "#10b981" }}>
          <div>
            <p style={{ fontSize: "13px", color: "var(--color-text-muted)", fontWeight: 700 }}>EVENTS REGISTERED</p>
            <h3 className="stat-value">{data.registered_count}</h3>
          </div>
          <CheckCircle size={32} color="#10b981" style={{ opacity: 0.8 }} />
        </div>
        <div className="stat-box" style={{ borderLeftColor: "#0284c7" }}>
          <div>
            <p style={{ fontSize: "13px", color: "var(--color-text-muted)", fontWeight: 700 }}>TOTAL PARTICIPATION</p>
            <h3 className="stat-value">{data.total_participation}</h3>
          </div>
          <Users size={32} color="#0284c7" style={{ opacity: 0.8 }} />
        </div>
      </div>

      {/* Row 3: Solo and Team Events Allowed List */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px", marginTop: "32px" }}>
        {/* Solo Events List */}
        <div className="card">
          <h3 style={{ fontSize: "18px", color: "var(--color-primary)", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "var(--color-primary-light)" }}></span>
            Allowed Solo Events ({data.solo_events.length})
          </h3>
          {data.solo_events.length === 0 ? (
            <p style={{ color: "var(--color-text-muted)", fontSize: "14px" }}>No solo events issued to this department.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxHeight: "400px", overflowY: "auto", paddingRight: "8px" }}>
              {data.solo_events.map(ev => (
                <div key={ev.id} style={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "center",
                  padding: "14px 18px",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--color-border)",
                  backgroundColor: ev.registered ? "#f0fdf4" : "#f8fafc"
                }}>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: "14px" }}>{ev.name}</p>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap", marginTop: "4px" }}>
                      <span className={`event-card-badge ${ev.gender === 'boys' ? 'badge-boys' : 'badge-girls'}`}>
                        {ev.gender}
                      </span>
                      {ev.other_details && (
                        <span className="event-card-badge" style={{ backgroundColor: "#f1f5f9", color: "#64748b" }}>
                          {ev.other_details}
                        </span>
                      )}
                      <span style={{ fontSize: "11px", color: "var(--color-text-muted)", display: "inline-flex", alignItems: "center", gap: "3px" }}>
                        <Clock size={10} /> {formatEventDeadline(ev.id)}
                      </span>
                    </div>
                  </div>
                  {ev.registered ? (
                    <span style={{ color: "var(--color-success)", fontSize: "12px", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px" }}>
                      <CheckCircle size={14} /> Registered
                    </span>
                  ) : (
                    <span style={{ color: "var(--color-text-muted)", fontSize: "12px" }}>Not Registered</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Team Events List */}
        <div className="card">
          <h3 style={{ fontSize: "18px", color: "var(--color-primary)", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "var(--color-accent)" }}></span>
            Allowed Team Events ({data.team_events.length})
          </h3>
          {data.team_events.length === 0 ? (
            <p style={{ color: "var(--color-text-muted)", fontSize: "14px" }}>No team events issued to this department.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxHeight: "400px", overflowY: "auto", paddingRight: "8px" }}>
              {data.team_events.map(ev => (
                <div key={ev.id} style={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "center",
                  padding: "14px 18px",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--color-border)",
                  backgroundColor: ev.registered ? "#f0fdf4" : "#f8fafc"
                }}>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: "14px" }}>{ev.name}</p>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap", marginTop: "4px" }}>
                      <span className={`event-card-badge ${ev.gender === 'boys' ? 'badge-boys' : 'badge-girls'}`}>
                        {ev.gender}
                      </span>
                      {ev.other_details && (
                        <span className="event-card-badge" style={{ backgroundColor: "#f1f5f9", color: "#64748b" }}>
                          {ev.other_details}
                        </span>
                      )}
                      <span style={{ fontSize: "11px", color: "var(--color-text-muted)", display: "inline-flex", alignItems: "center", gap: "3px" }}>
                        <Clock size={10} /> {formatEventDeadline(ev.id)}
                      </span>
                    </div>
                  </div>
                  {ev.registered ? (
                    <span style={{ color: "var(--color-success)", fontSize: "12px", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px" }}>
                      <CheckCircle size={14} /> Registered
                    </span>
                  ) : (
                    <span style={{ color: "var(--color-text-muted)", fontSize: "12px" }}>Not Registered</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Rules Modal Overlay */}
      {showRules && (
        <div className="modal-overlay" onClick={() => setShowRules(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "1px solid var(--color-border)", paddingBottom: "12px" }}>
              <h2 style={{ color: "var(--color-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
                <AlertCircle color="var(--color-primary-light)" />
                SJC Sports Day Rules
              </h2>
              <button 
                onClick={() => setShowRules(false)}
                style={{ background: "transparent", border: "none", fontSize: "20px", cursor: "pointer", color: "var(--color-text-muted)" }}
              >
                &times;
              </button>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {data.rules.length === 0 ? (
                <p style={{ color: "var(--color-text-muted)" }}>No rules set by the administrator yet.</p>
              ) : (
                data.rules.map((rule, idx) => (
                  <div key={idx} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                    <div style={{ 
                      backgroundColor: "#eff6ff", 
                      color: "var(--color-primary)", 
                      fontWeight: 700, 
                      width: "24px", 
                      height: "24px", 
                      borderRadius: "50%", 
                      display: "flex", 
                      alignItems: "center", 
                      justifyContent: "center",
                      flexShrink: 0,
                      fontSize: "12px"
                    }}>
                      {idx + 1}
                    </div>
                    <p style={{ fontSize: "14px", color: "var(--color-text-dark)", paddingTop: "2px" }}>
                      {rule}
                    </p>
                  </div>
                ))
              )}
            </div>
            
            <button className="btn-primary" onClick={() => setShowRules(false)} style={{ marginTop: "32px", width: "100%" }}>
              I Understand
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DepartmentDashboard;
