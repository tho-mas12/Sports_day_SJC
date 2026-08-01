import React, { useState, useEffect } from "react";
import { ListPlus, CalendarDays, Save, Trash2, Edit3, Check, Plus, AlertCircle } from "lucide-react";
import CustomPopup from "./CustomPopup";

function AdminRulesDeadlines() {
  const [activeTab, setActiveTab] = useState("rules"); // "rules" or "deadlines"
  const [events, setEvents] = useState([]);
  const [rules, setRules] = useState([]);
  const [commonDeadline, setCommonDeadline] = useState("");
  const [eventDeadlines, setEventDeadlines] = useState({}); // { event_id: ISOString }
  
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [notification, setNotification] = useState("");

  // Custom Popup State
  const [popup, setPopup] = useState({
    isOpen: false,
    type: "success",
    title: "",
    message: "",
    onConfirm: null
  });

  // Rules editor state
  const [newRule, setNewRule] = useState("");
  const [editingRuleIndex, setEditingRuleIndex] = useState(-1);
  const [editingRuleText, setEditingRuleText] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      const evRes = await fetch("/api/admin/events");
      const evData = await evRes.json();
      
      const rdRes = await fetch("/api/admin/rules-deadlines");
      const rdData = await rdRes.json();

      if (evRes.ok && rdRes.ok) {
        setEvents(evData);
        setRules(rdData.rules || []);
        setNotification(rdData.notification || "");
        
        // Convert ISO format to datetime-local input format (YYYY-MM-DDTHH:MM)
        if (rdData.common_deadline) {
          setCommonDeadline(rdData.common_deadline.slice(0, 16));
        }
        
        // Convert event deadlines
        const cleanEventDeadlines = {};
        if (rdData.event_deadlines) {
          Object.keys(rdData.event_deadlines).forEach(k => {
            if (rdData.event_deadlines[k]) {
              cleanEventDeadlines[k] = rdData.event_deadlines[k].slice(0, 16);
            }
          });
        }
        setEventDeadlines(cleanEventDeadlines);
      } else {
        setErrorMsg("Failed to load settings.");
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

  // 1. Save Rules
  const handleSaveRules = async (updatedRulesList) => {
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const res = await fetch("/api/admin/rules", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rules: updatedRulesList })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg("Rules updated successfully.");
        setRules(updatedRulesList);
      } else {
        setErrorMsg(data.detail || "Failed to save rules.");
      }
    } catch (err) {
      setErrorMsg("Failed to save rules.");
    }
  };

  const handleAddRule = (e) => {
    e.preventDefault();
    if (!newRule.trim()) return;
    const updated = [...rules, newRule.trim()];
    handleSaveRules(updated);
    setNewRule("");
  };

  const handleDeleteRule = (index) => {
    setPopup({
      isOpen: true,
      type: "confirm",
      title: "Delete Rule",
      message: "Are you sure you want to delete this rule?",
      onConfirm: () => proceedDeleteRule(index)
    });
  };

  const proceedDeleteRule = (index) => {
    const updated = rules.filter((_, idx) => idx !== index);
    handleSaveRules(updated);
    setPopup({
      isOpen: true,
      type: "success",
      title: "Rule Deleted",
      message: "Rule has been deleted successfully."
    });
  };

  const startEditRule = (index, text) => {
    setEditingRuleIndex(index);
    setEditingRuleText(text);
  };

  const handleSaveEditRule = () => {
    if (!editingRuleText.trim()) return;
    const updated = [...rules];
    updated[editingRuleIndex] = editingRuleText.trim();
    handleSaveRules(updated);
    setEditingRuleIndex(-1);
    setEditingRuleText("");
  };

  // 2. Save Deadlines
  const handleSaveDeadlines = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    // Prepare dates back to ISO strings
    const commonISO = commonDeadline ? new Date(commonDeadline).toISOString() : null;
    
    const eventDeadlinesISO = {};
    Object.keys(eventDeadlines).forEach(k => {
      if (eventDeadlines[k]) {
        eventDeadlinesISO[k] = new Date(eventDeadlines[k]).toISOString();
      }
    });

    try {
      const res = await fetch("/api/admin/deadlines", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          common_deadline: commonISO,
          event_deadlines: eventDeadlinesISO
        })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg("Deadlines updated successfully.");
        loadData();
      } else {
        setErrorMsg(data.detail || "Failed to update deadlines.");
      }
    } catch (err) {
      setErrorMsg("Failed to connect to backend server.");
    }
  };

  const handleEventDeadlineChange = (eventId, value) => {
    setEventDeadlines({
      ...eventDeadlines,
      [eventId]: value
    });
  };

  const clearEventDeadline = (eventId) => {
    const updated = { ...eventDeadlines };
    delete updated[eventId];
    setEventDeadlines(updated);
  };

  const handleSaveNotification = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const res = await fetch("/api/admin/notification", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: notification })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg("Notification updated successfully.");
      } else {
        setErrorMsg(data.detail || "Failed to update notification.");
      }
    } catch (err) {
      setErrorMsg("Failed to connect to backend server.");
    }
  };

  const formatDateTimeAMPM = (dtStr) => {
    if (!dtStr) return "Not Set";
    try {
      const date = new Date(dtStr);
      if (isNaN(date.getTime())) return "Invalid Date";
      return date.toLocaleString('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      });
    } catch (e) {
      return "Invalid Date";
    }
  };

  if (loading) {
    return <div style={{ padding: "40px", textAlign: "center", color: "var(--color-text-muted)" }}>Loading settings...</div>;
  }

  return (
    <div className="animate-fade-in">
      {/* Header Banner */}
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "28px", color: "var(--color-primary)", marginBottom: "4px" }}>
          Rules and Deadlines Configuration
        </h1>
        <p style={{ color: "var(--color-text-muted)", fontSize: "14px" }}>
          Edit the sports day rules sheet and set global or event-specific countdown timers
        </p>
      </div>

      {/* Tabs list */}
      <div className="tab-container">
        <button 
          className={`tab-btn ${activeTab === "rules" ? "active" : ""}`}
          onClick={() => { setActiveTab("rules"); setErrorMsg(""); setSuccessMsg(""); }}
        >
          <ListPlus size={16} style={{ verticalAlign: "middle", marginRight: "6px" }} />
          Rules Sheet
        </button>
        <button 
          className={`tab-btn ${activeTab === "deadlines" ? "active" : ""}`}
          onClick={() => { setActiveTab("deadlines"); setErrorMsg(""); setSuccessMsg(""); }}
        >
          <CalendarDays size={16} style={{ verticalAlign: "middle", marginRight: "6px" }} />
          Registration Deadlines
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

      {/* 1. Rules Tab view */}
      {activeTab === "rules" ? (
        <div className="card">
          <h3 style={{ fontSize: "18px", marginBottom: "20px", color: "var(--color-primary)" }}>
            General Rules & Regulations
          </h3>

          {/* Add rule inline form */}
          <form onSubmit={handleAddRule} style={{ display: "flex", gap: "12px", marginBottom: "28px" }}>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Type a new rule sentence..." 
              value={newRule}
              onChange={e => setNewRule(e.target.value)}
              style={{ flex: 1 }}
              required 
            />
            <button type="submit" className="btn-primary">
              <Plus size={16} /> Add Rule
            </button>
          </form>

          {/* Rules lists */}
          <div style={{ display: "flex", flexSelf: "stretch", flexDirection: "column", gap: "14px" }}>
            {rules.length === 0 ? (
              <p style={{ color: "var(--color-text-muted)" }}>No rules registered.</p>
            ) : (
              rules.map((rule, idx) => (
                <div key={idx} style={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "center",
                  padding: "16px",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-md)",
                  backgroundColor: "#f8fafc"
                }}>
                  {editingRuleIndex === idx ? (
                    <div style={{ display: "flex", gap: "10px", flex: 1, marginRight: "12px" }}>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={editingRuleText} 
                        onChange={e => setEditingRuleText(e.target.value)}
                        style={{ backgroundColor: "white" }}
                      />
                      <button type="button" className="btn-primary" onClick={handleSaveEditRule} style={{ padding: "8px 12px" }}>
                        <Check size={14} />
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: "flex", gap: "12px", alignItems: "flex-start", marginRight: "16px" }}>
                      <span style={{ 
                        backgroundColor: "#eff6ff", 
                        color: "var(--color-primary)", 
                        fontWeight: 700, 
                        width: "22px", 
                        height: "22px", 
                        borderRadius: "50%", 
                        display: "flex", 
                        alignItems: "center", 
                        justifyContent: "center",
                        fontSize: "11px",
                        flexShrink: 0
                      }}>
                        {idx + 1}
                      </span>
                      <p style={{ fontSize: "14px", color: "var(--color-text-dark)", paddingTop: "1px" }}>{rule}</p>
                    </div>
                  )}

                  <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                    {editingRuleIndex !== idx && (
                      <button className="btn-secondary" style={{ padding: "6px 10px" }} onClick={() => startEditRule(idx, rule)}>
                        <Edit3 size={12} />
                      </button>
                    )}
                    <button className="btn-secondary" style={{ padding: "6px 10px", border: "1px solid #fee2e2", color: "var(--color-danger)" }} onClick={() => handleDeleteRule(idx)}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        /* 2. Deadlines Tab view */
        <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
          
          {/* Card for Announcement / Notification */}
          <div className="card">
            <h3 style={{ fontSize: "18px", color: "var(--color-primary)", marginBottom: "8px" }}>
              Live Announcement / Notification Banner
            </h3>
            <p style={{ color: "var(--color-text-muted)", fontSize: "13px", marginBottom: "20px" }}>
              Add text below to display a scrolling marquee notification banner at the top of the Department portals. Leave blank to hide the banner.
            </p>
            <form onSubmit={handleSaveNotification} style={{ display: "flex", gap: "12px" }}>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Enter alert or notification text (e.g. Last date extended to 15th June!)" 
                value={notification}
                onChange={e => setNotification(e.target.value)}
                style={{ flex: 1 }}
              />
              <button type="submit" className="btn-primary">
                <Save size={16} /> Save Announcement
              </button>
            </form>
          </div>

          <form onSubmit={handleSaveDeadlines}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "32px" }}>
              
              {/* Card 1: Common Deadline */}
              <div className="card">
                <h3 style={{ fontSize: "18px", color: "var(--color-primary)", marginBottom: "8px" }}>
                  Common System-Wide Deadline
                </h3>
                <p style={{ color: "var(--color-text-muted)", fontSize: "13px", marginBottom: "24px" }}>
                  This deadline applies to all sports registrations unless a specific custom event deadline is defined below.
                </p>
                
                <div className="form-group" style={{ maxWidth: "400px" }}>
                  <label className="form-label">Common Expiration Datetime</label>
                  <input 
                    type="datetime-local" 
                    className="form-input" 
                    value={commonDeadline}
                    onChange={e => setCommonDeadline(e.target.value)}
                    required 
                  />
                  <div style={{ marginTop: "6px", fontSize: "13px", color: "var(--color-primary-light)", fontWeight: 600 }}>
                    Formatted Preview: {formatDateTimeAMPM(commonDeadline)}
                  </div>
                </div>
              </div>

              {/* Card 2: Custom Event-Specific Deadlines */}
              <div className="card">
                <h3 style={{ fontSize: "18px", color: "var(--color-primary)", marginBottom: "8px" }}>
                  Custom Event Overrides
                </h3>
                <p style={{ color: "var(--color-text-muted)", fontSize: "13px", marginBottom: "20px" }}>
                  Selectively assign custom closing timers to individual events. Leaving an event blank makes it fall back to the Common Deadline.
                </p>

                <div style={{ maxHeight: "400px", overflowY: "auto", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)" }}>
                  <table className="custom-table" style={{ width: "100%" }}>
                    <thead>
                      <tr>
                        <th>Event Name</th>
                        <th>Type / Gender</th>
                        <th>Custom Deadline Override</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {events.map(ev => (
                        <tr key={ev._id}>
                          <td style={{ fontWeight: 700 }}>{ev.name}</td>
                          <td>
                            <span className={`event-card-badge ${ev.type === 'solo' ? 'badge-solo' : 'badge-team'}`}>
                              {ev.type}
                            </span>
                            <span className={`event-card-badge ${ev.gender === 'boys' ? 'badge-boys' : 'badge-girls'}`} style={{ marginLeft: "6px" }}>
                              {ev.gender}
                            </span>
                          </td>
                          <td>
                            <input 
                              type="datetime-local"
                              className="form-input"
                              style={{ padding: "6px 12px", fontSize: "13px", width: "220px" }}
                              value={eventDeadlines[ev._id] || ""}
                              onChange={e => handleEventDeadlineChange(ev._id, e.target.value)}
                            />
                            {eventDeadlines[ev._id] && (
                              <div style={{ marginTop: "4px", fontSize: "11px", color: "var(--color-primary-light)", fontWeight: 600 }}>
                                Formatted Preview: {formatDateTimeAMPM(eventDeadlines[ev._id])}
                              </div>
                            )}
                          </td>
                          <td>
                            {eventDeadlines[ev._id] && (
                              <button 
                                type="button" 
                                className="btn-secondary" 
                                style={{ padding: "6px 12px", fontSize: "11px", color: "var(--color-danger)" }}
                                onClick={() => clearEventDeadline(ev._id)}
                              >
                                Reset
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Sticky Save Bar */}
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "12px" }}>
                <button type="submit" className="btn-primary" style={{ padding: "14px 28px", fontSize: "15px" }}>
                  <Save size={16} /> Save All Deadlines
                </button>
              </div>

            </div>
          </form>
        </div>
      )}
      <CustomPopup 
        isOpen={popup.isOpen}
        type={popup.type}
        title={popup.title}
        message={popup.message}
        onClose={() => setPopup({ ...popup, isOpen: false })}
        onConfirm={popup.onConfirm}
      />
    </div>
  );
}

export default AdminRulesDeadlines;
