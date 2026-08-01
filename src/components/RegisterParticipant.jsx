import React, { useState, useEffect } from "react";
import { ArrowLeft, User, UserPlus, Users, BadgeAlert, CheckCircle, ShieldAlert, Trophy, Award } from "lucide-react";

const getEventImage = (eventName) => {
  const name = eventName.toLowerCase();
  if (name.includes("relay")) return "https://images.unsplash.com/photo-1502224562085-639556652f33?w=500&auto=format&fit=crop&q=60";
  if (name.includes("jump") || name.includes("vault")) return "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=500&auto=format&fit=crop&q=60";
  if (name.includes("throw") || name.includes("put")) return "https://images.unsplash.com/photo-1541252260730-0412e8e2108e?w=500&auto=format&fit=crop&q=60";
  if (name.includes("dash") || name.includes("race") || name.includes("hurdles")) return "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=500&auto=format&fit=crop&q=60";
  return "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=500&auto=format&fit=crop&q=60";
};

const EXCEPTION_EVENTS = [
  "800 mts. race", "1500 mts. race", "5000 mts. race", "10,000 mts. race", "20 km walk",
  "800 mts race", "1500 mts race", "5000 mts race", "10000 mts race", "20km walk"
];

function RegisterParticipant({ user, onNavigate }) {
  const [allowedEvents, setAllowedEvents] = useState([]);
  const [deptRegs, setDeptRegs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [commonDeadline, setCommonDeadline] = useState(null);
  const [eventDeadlines, setEventDeadlines] = useState({});

  // Solo form states
  const [soloName, setSoloName] = useState("");
  const [soloDeptNum, setSoloDeptNum] = useState("");
  const [soloGender, setSoloGender] = useState("male");
  const [rulesDisclaimer, setRulesDisclaimer] = useState("");

  // Team form states
  const [teamLeaderName, setTeamLeaderName] = useState("");
  const [teamLeaderDeptNum, setTeamLeaderDeptNum] = useState("");
  const [isLeaderAdded, setIsLeaderAdded] = useState(false);
  const [memberName, setMemberName] = useState("");
  const [memberDeptNum, setMemberDeptNum] = useState("");
  const [memberGender, setMemberGender] = useState("male");
  const [teamMembers, setTeamMembers] = useState([]); // List of added members

  // Fetch initial allowed events and existing registrations
  const loadData = async () => {
    try {
      setLoading(true);
      const dashRes = await fetch(`/api/department/${user.dept_id}/dashboard`);
      const dashData = await dashRes.json();
      
      const regsRes = await fetch(`/api/registration/${user.dept_id}`);
      const regsData = await regsRes.json();

      if (dashRes.ok && regsRes.ok) {
        // Combine solo and team events
        const combinedEvents = [...dashData.solo_events, ...dashData.team_events];
        setAllowedEvents(combinedEvents);
        setDeptRegs(regsData);
        setCommonDeadline(dashData.common_deadline);
        setEventDeadlines(dashData.event_deadlines || {});
      } else {
        setErrorMsg("Failed to load registration data.");
      }
    } catch (err) {
      setErrorMsg("Failed to connect to backend server.");
    } finally {
      setLoading(false);
    }
  };

  const isDeadlinePassed = (eventId) => {
    const dlStr = eventDeadlines[eventId] || commonDeadline;
    if (!dlStr) return false;
    try {
      const dl = new Date(dlStr);
      return new Date() > dl;
    } catch (e) {
      return false;
    }
  };

  useEffect(() => {
    loadData();
  }, [user.dept_id]);

  // Client-side rule checking for Solo input
  useEffect(() => {
    if (!selectedEvent || selectedEvent.type !== "solo" || !soloDeptNum) {
      setRulesDisclaimer("");
      return;
    }

    const deptNumClean = soloDeptNum.trim();
    if (!deptNumClean) {
      setRulesDisclaimer("");
      return;
    }

    // 1. Check event count for this student ID
    let eventCount = 0;
    deptRegs.forEach(r => {
      if (r.type === "solo" && r.student_id === deptNumClean) {
        eventCount++;
      } else if (r.type === "team") {
        if (r.team_leader?.dept_num === deptNumClean) eventCount++;
        r.members?.forEach(m => {
          if (m.dept_num === deptNumClean) eventCount++;
        });
      }
    });

    if (eventCount >= 4) {
      setRulesDisclaimer(`Warning: Student '${deptNumClean}' has already registered for ${eventCount} events. Submitting will violate the 4-event limit rule.`);
      return;
    }

    // 2. Check 3-athlete limit for non-excepted events
    const isException = EXCEPTION_EVENTS.some(ex => selectedEvent.name.toLowerCase().includes(ex));
    if (!isException) {
      const athletesRegistered = deptRegs.filter(r => r.event_id === selectedEvent.id).length;
      if (athletesRegistered >= 3) {
        setRulesDisclaimer(`Error: You have already registered 3 athletes for '${selectedEvent.name}'. Non-distance events are capped at 3 athletes per department.`);
        return;
      }
    }

    setRulesDisclaimer("");
  }, [soloDeptNum, selectedEvent, deptRegs]);

  const handleRegisterClick = (event) => {
    if (event.registered) return; // Prevent clicking registered cards
    setSelectedEvent(event);
    setErrorMsg("");
    setSuccessMsg("");
    // Reset solo states
    setSoloName("");
    setSoloDeptNum("");
    setSoloGender(event.gender === "girls" ? "female" : "male");
    // Reset team states
    setTeamLeaderName("");
    setTeamLeaderDeptNum("");
    setIsLeaderAdded(false);
    setTeamMembers([]);
    setMemberName("");
    setMemberDeptNum("");
    setMemberGender(event.gender === "girls" ? "female" : "male");
  };

  const handleSoloSubmit = async (e) => {
    e.preventDefault();
    if (!soloName || !soloDeptNum || !soloGender) {
      setErrorMsg("Please fill in all details.");
      return;
    }

    try {
      const res = await fetch("/api/registration/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_id: selectedEvent.id,
          department_id: user.dept_id,
          type: "solo",
          student_id: soloDeptNum.trim(),
          student_name: soloName.trim(),
          gender: soloGender
        })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg("Registration successful!");
        setSelectedEvent(null);
        loadData(); // reload
      } else {
        setErrorMsg(data.detail || "Registration failed.");
      }
    } catch (err) {
      setErrorMsg("Failed to submit registration.");
    }
  };

  // Add Team Leader
  const handleAddLeader = (e) => {
    e.preventDefault();
    if (!teamLeaderName || !teamLeaderDeptNum) {
      setErrorMsg("Please enter Team Leader name and department number.");
      return;
    }
    setIsLeaderAdded(true);
    setErrorMsg("");
  };

  // Add Team Member one-by-one
  const handleAddMember = (e) => {
    e.preventDefault();
    if (!memberName || !memberDeptNum) {
      setErrorMsg("Please enter member details.");
      return;
    }

    // Check if member is already in the list
    const isDup = teamMembers.some(m => m.dept_num === memberDeptNum.trim()) || (teamLeaderDeptNum.trim() === memberDeptNum.trim());
    if (isDup) {
      setErrorMsg("Student already added to the team.");
      return;
    }

    const newMember = {
      name: memberName.trim(),
      dept_num: memberDeptNum.trim(),
      gender: memberGender
    };

    setTeamMembers([...teamMembers, newMember]);
    setMemberName("");
    setMemberDeptNum("");
    setErrorMsg("");
  };

  const handleTeamSubmit = async (e) => {
    e.preventDefault();
    const targetSize = selectedEvent.max_members || 4;
    if (!isLeaderAdded || teamMembers.length !== (targetSize - 1)) {
      setErrorMsg(`Roster must have exactly ${targetSize} members (1 Leader + ${targetSize - 1} Members).`);
      return;
    }

    try {
      const res = await fetch("/api/registration/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_id: selectedEvent.id,
          department_id: user.dept_id,
          type: selectedEvent.type,
          team_leader: {
            name: teamLeaderName.trim(),
            dept_num: teamLeaderDeptNum.trim()
          },
          members: teamMembers
        })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg("Team registration successful!");
        setSelectedEvent(null);
        loadData();
      } else {
        setErrorMsg(data.detail || "Team registration failed.");
      }
    } catch (err) {
      setErrorMsg("Failed to submit team registration.");
    }
  };

  if (loading) {
    return <div style={{ padding: "40px", textAlign: "center", color: "var(--color-text-muted)" }}>Loading events...</div>;
  }

  return (
    <div className="animate-fade-in">
      {/* Back to dashboard header */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "32px" }}>
        <button 
          className="btn-secondary" 
          style={{ padding: "8px 12px" }}
          onClick={() => {
            if (selectedEvent) setSelectedEvent(null);
            else onNavigate("dashboard");
          }}
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 style={{ fontSize: "24px", color: "var(--color-primary)" }}>
            {selectedEvent ? `Register: ${selectedEvent.name}` : "Event Registration"}
          </h1>
          <p style={{ color: "var(--color-text-muted)", fontSize: "14px" }}>
            {selectedEvent ? "Enter details of the athlete(s) to register" : "Select an event below to register participants"}
          </p>
        </div>
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

      {/* 1. Main Grid of Event Cards */}
      {!selectedEvent ? (
        <div className="event-grid">
          {allowedEvents.length === 0 ? (
            <div style={{ gridColumn: "1/-1", padding: "40px", textAlign: "center", color: "var(--color-text-muted)" }}>
              No sports events have been issued to this department yet. Please contact the Admin.
            </div>
          ) : (
            allowedEvents.map(ev => {
              const isPassed = isDeadlinePassed(ev.id);
              const isSolo = ev.type === "solo";
              return (
                <div 
                  key={ev.id} 
                  className={`event-card ${ev.registered || isPassed ? "event-card-shaded" : ""}`}
                  style={{
                    minHeight: "180px",
                    padding: "24px",
                    borderLeft: `5px solid ${isPassed ? "#ef4444" : ev.registered ? "#10b981" : isSolo ? "var(--color-primary-light)" : "var(--color-accent)"}`,
                    boxShadow: "var(--shadow-sm)",
                    borderRadius: "var(--radius-md)",
                    display: "flex",
                    flexDirection: "column"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                      <span className={`event-card-badge ${ev.type === "solo" ? "badge-solo" : "badge-team"}`} style={{ margin: 0 }}>
                        {ev.type}
                      </span>
                      <span className={`event-card-badge ${ev.gender === "boys" ? "badge-boys" : "badge-girls"}`} style={{ margin: 0 }}>
                        {ev.gender}
                      </span>
                      {isPassed && (
                        <span className="event-card-badge" style={{ margin: 0, backgroundColor: "#fca5a5", color: "#991b1b" }}>
                          Passed
                        </span>
                      )}
                    </div>
                    <div style={{ color: isPassed ? "#ef4444" : ev.registered ? "#10b981" : "#94a3b8" }}>
                      {ev.registered ? <CheckCircle size={20} /> : isSolo ? <User size={20} /> : <Users size={20} />}
                    </div>
                  </div>
                  
                  <h3 className="event-card-title" style={{ fontSize: "16px", color: "var(--color-primary)", fontWeight: 800, marginBottom: "20px" }}>
                    {ev.name}
                  </h3>
                  
                  <button 
                    className="btn-primary" 
                    style={{ 
                      width: "100%", 
                      marginTop: "auto", 
                      padding: "10px",
                      backgroundColor: isPassed ? "#ef4444" : ev.registered ? "#10b981" : undefined 
                    }}
                    onClick={() => !isPassed && handleRegisterClick(ev)}
                    disabled={ev.registered || isPassed}
                  >
                    {ev.registered ? "Registered" : isPassed ? "Deadline Passed" : "Register"}
                  </button>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* 2. Registration Form Container */
        <div className="card animate-scale-up">
          {selectedEvent.type === "solo" ? (
            // Solo Event Form
            <form onSubmit={handleSoloSubmit}>
              <div className="form-group">
                <label className="form-label">Athlete Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={soloName}
                  onChange={e => setSoloName(e.target.value)}
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Department Number</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={soloDeptNum}
                  onChange={e => setSoloDeptNum(e.target.value)}
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Gender</label>
                {selectedEvent.gender === "boys" ? (
                  <select className="form-select" value="male" disabled>
                    <option value="male">Male (Boys Competition)</option>
                  </select>
                ) : selectedEvent.gender === "girls" ? (
                  <select className="form-select" value="female" disabled>
                    <option value="female">Female (Girls Competition)</option>
                  </select>
                ) : (
                  <select className="form-select" value={soloGender} onChange={e => setSoloGender(e.target.value)}>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                )}
              </div>

              {/* Rules check disclaimer block */}
              {rulesDisclaimer && (
                <div style={{ 
                  padding: "12px 16px", 
                  backgroundColor: rulesDisclaimer.includes("Error") ? "#fef2f2" : "#fffbeb",
                  border: `1px solid ${rulesDisclaimer.includes("Error") ? "#fee2e2" : "#fef3c7"}`,
                  color: rulesDisclaimer.includes("Error") ? "var(--color-danger)" : "var(--color-warning)",
                  borderRadius: "var(--radius-md)",
                  fontSize: "13px",
                  fontWeight: 600,
                  marginBottom: "20px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px"
                }}>
                  <ShieldAlert size={16} />
                  <span>{rulesDisclaimer}</span>
                </div>
              )}

              <div style={{ display: "flex", gap: "12px", marginTop: "32px" }}>
                <button type="button" className="btn-secondary" onClick={() => setSelectedEvent(null)} style={{ flex: 1 }}>
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-primary" 
                  style={{ flex: 1 }}
                  disabled={rulesDisclaimer.includes("Error")}
                >
                  Confirm Registration
                </button>
              </div>
            </form>
          ) : (
            // Team Event Form (Relay builder)
            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "32px" }}>
              {/* Form entries */}
              <div>
                {/* Step 1: Team Leader */}
                <div style={{ borderBottom: "1px solid var(--color-border)", paddingBottom: "20px", marginBottom: "20px" }}>
                  <h3 style={{ fontSize: "16px", marginBottom: "12px", color: "var(--color-primary)" }}>
                    1. Register Team Member (Leader)
                  </h3>
                  <div className="form-group">
                    <label className="form-label">Team Member Name</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={teamLeaderName}
                      onChange={e => setTeamLeaderName(e.target.value)}
                      disabled={isLeaderAdded}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Department Number</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={teamLeaderDeptNum}
                      onChange={e => setTeamLeaderDeptNum(e.target.value)}
                      disabled={isLeaderAdded}
                    />
                  </div>
                  {!isLeaderAdded ? (
                    <button type="button" className="btn-primary" onClick={handleAddLeader} style={{ width: "100%" }}>
                      Add Team Member
                    </button>
                  ) : (
                    <p style={{ color: "var(--color-success)", fontSize: "13px", fontWeight: 700 }}>
                      ✓ Team Member Added
                    </p>
                  )}
                </div>

                {/* Step 2: Add Members */}
                <div style={{ display: isLeaderAdded ? "block" : "none" }}>
                  <h3 style={{ fontSize: "16px", marginBottom: "12px", color: "var(--color-primary)" }}>
                    2. Add Additional Members ({teamMembers.length + 1} / {selectedEvent.max_members || 4} registered)
                  </h3>
                  {teamMembers.length >= ((selectedEvent.max_members || 4) - 1) ? (
                    <p style={{ color: "var(--color-success)", fontSize: "14px", fontWeight: 600, marginBottom: "20px" }}>
                      Roster full ({selectedEvent.max_members || 4} athletes selected). You can submit now.
                    </p>
                  ) : (
                    <>
                      <div className="form-group">
                        <label className="form-label">Member Name</label>
                        <input 
                          type="text" 
                          className="form-input" 
                          value={memberName}
                          onChange={e => setMemberName(e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Department Number</label>
                        <input 
                          type="text" 
                          className="form-input" 
                          value={memberDeptNum}
                          onChange={e => setMemberDeptNum(e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Gender</label>
                        {selectedEvent.gender === "boys" ? (
                          <select className="form-select" value="male" disabled>
                            <option value="male">Male</option>
                          </select>
                        ) : selectedEvent.gender === "girls" ? (
                          <select className="form-select" value="female" disabled>
                            <option value="female">Female</option>
                          </select>
                        ) : (
                          <select className="form-select" value={memberGender} onChange={e => setMemberGender(e.target.value)}>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                          </select>
                        )}
                      </div>
                      <button type="button" className="btn-secondary" onClick={handleAddMember} style={{ width: "100%" }}>
                        Add Team Member
                      </button>
                    </>
                  )}
                </div>

                <div style={{ display: "flex", gap: "12px", marginTop: "32px" }}>
                  <button type="button" className="btn-secondary" onClick={() => setSelectedEvent(null)} style={{ flex: 1 }}>
                    Cancel
                  </button>
                  <button 
                    type="button" 
                    className="btn-primary" 
                    onClick={handleTeamSubmit} 
                    style={{ flex: 1 }}
                    disabled={!isLeaderAdded || teamMembers.length !== ((selectedEvent.max_members || 4) - 1)}
                  >
                    Submit Roster
                  </button>
                </div>
              </div>

              {/* Preview Box on the Right */}
              <div style={{ backgroundColor: "#f8fafc", padding: "24px", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)" }}>
                <h3 style={{ fontSize: "16px", marginBottom: "16px", color: "var(--color-primary-light)", borderBottom: "1px solid var(--color-border)", paddingBottom: "8px" }}>
                  Team Members List (Roster Edit)
                </h3>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  {/* Leader Row */}
                  {isLeaderAdded ? (
                    <div style={{ padding: "12px", backgroundColor: "#eff6ff", borderRadius: "var(--radius-sm)", border: "1px solid #dbeafe", display: "flex", flexDirection: "column", gap: "8px", position: "relative" }}>
                      <p style={{ fontSize: "10px", fontWeight: 800, color: "var(--color-primary)", textTransform: "uppercase" }}>Team Member 1 (Leader)</p>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label" style={{ fontSize: "10px" }}>Name</label>
                        <input 
                          type="text" 
                          className="form-input" 
                          style={{ padding: "6px 10px", fontSize: "13px", height: "32px", backgroundColor: "white" }} 
                          value={teamLeaderName} 
                          onChange={e => setTeamLeaderName(e.target.value)} 
                        />
                      </div>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label" style={{ fontSize: "10px" }}>Dept Number</label>
                        <input 
                          type="text" 
                          className="form-input" 
                          style={{ padding: "6px 10px", fontSize: "13px", height: "32px", backgroundColor: "white" }} 
                          value={teamLeaderDeptNum} 
                          onChange={e => setTeamLeaderDeptNum(e.target.value)} 
                        />
                      </div>
                      <button 
                        type="button"
                        style={{ position: "absolute", top: "10px", right: "12px", background: "none", border: "none", color: "var(--color-danger)", cursor: "pointer", fontWeight: 700, fontSize: "11px" }}
                        onClick={() => {
                          setIsLeaderAdded(false);
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div style={{ padding: "12px", border: "1px dashed var(--color-border)", borderRadius: "var(--radius-sm)", color: "var(--color-text-muted)", fontSize: "13px" }}>
                      No Team Leader added yet
                    </div>
                  )}

                  {/* Member Rows */}
                  {teamMembers.map((m, idx) => (
                    <div key={idx} style={{ padding: "12px", backgroundColor: "white", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)", display: "flex", flexDirection: "column", gap: "8px", position: "relative" }}>
                      <p style={{ fontSize: "10px", fontWeight: 800, color: "var(--color-text-muted)", textTransform: "uppercase" }}>Member #{idx+2}</p>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label" style={{ fontSize: "10px" }}>Name</label>
                        <input 
                          type="text" 
                          className="form-input" 
                          style={{ padding: "6px 10px", fontSize: "13px", height: "32px" }} 
                          value={m.name} 
                          onChange={e => {
                            const updated = [...teamMembers];
                            updated[idx].name = e.target.value;
                            setTeamMembers(updated);
                          }} 
                        />
                      </div>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label" style={{ fontSize: "10px" }}>Dept Number</label>
                        <input 
                          type="text" 
                          className="form-input" 
                          style={{ padding: "6px 10px", fontSize: "13px", height: "32px" }} 
                          value={m.dept_num} 
                          onChange={e => {
                            const updated = [...teamMembers];
                            updated[idx].dept_num = e.target.value;
                            setTeamMembers(updated);
                          }} 
                        />
                      </div>
                      
                      <button 
                        type="button"
                        style={{ position: "absolute", top: "10px", right: "12px", background: "none", border: "none", color: "var(--color-danger)", cursor: "pointer", fontWeight: 700, fontSize: "11px" }}
                        onClick={() => {
                          const updated = [...teamMembers];
                          updated.splice(idx, 1);
                          setTeamMembers(updated);
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  ))}

                  {/* Empty slots placeholders */}
                  {Array.from({ length: Math.max(0, ((selectedEvent.max_members || 4) - 1) - teamMembers.length) }).map((_, idx) => (
                    <div key={idx} style={{ padding: "12px", border: "1px dashed var(--color-border)", borderRadius: "var(--radius-sm)", color: "var(--color-text-muted)", fontSize: "13px" }}>
                      Empty Member Slot #{teamMembers.length + idx + 2}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default RegisterParticipant;
