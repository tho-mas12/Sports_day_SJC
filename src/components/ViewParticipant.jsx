import React, { useState, useEffect } from "react";
import { Trash2, Edit, Award, Users, User, ArrowLeft, ShieldAlert } from "lucide-react";
import CustomPopup from "./CustomPopup";

const EXCEPTION_EVENTS = [
  "800 mts. race", "1500 mts. race", "5000 mts. race", "10,000 mts. race", "20 km walk",
  "800 mts race", "1500 mts race", "5000 mts race", "10000 mts race", "20km walk"
];

function ViewParticipant({ user }) {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [popup, setPopup] = useState({
    isOpen: false,
    type: "success",
    title: "",
    message: ""
  });
  
  const showError = (msg) => {
    if (!msg) return;
    setPopup({
      isOpen: true,
      type: "danger",
      title: "Error",
      message: msg
    });
  };

  const showSuccess = (msg) => {
    if (!msg) return;
    setPopup({
      isOpen: true,
      type: "success",
      title: "Success",
      message: msg
    });
  };

  const setErrorMsg = showError;
  const setSuccessMsg = showSuccess;
  
  // Edit states
  const [editingReg, setEditingReg] = useState(null);
  const [soloName, setSoloName] = useState("");
  const [soloDeptNum, setSoloDeptNum] = useState("");
  const [soloGender, setSoloGender] = useState("male");
  const [rulesDisclaimer, setRulesDisclaimer] = useState("");

  const [teamLeaderName, setTeamLeaderName] = useState("");
  const [teamLeaderDeptNum, setTeamLeaderDeptNum] = useState("");
  const [teamMembers, setTeamMembers] = useState([]);
  const [memberName, setMemberName] = useState("");
  const [memberDeptNum, setMemberDeptNum] = useState("");
  const [memberGender, setMemberGender] = useState("male");

  const loadRegistrations = () => {
    setLoading(true);
    fetch(`/api/registration/${user.dept_id}`)
      .then(res => {
        if (!res.ok) throw new Error("Failed to load registrations");
        return res.json();
      })
      .then(data => {
        setRegistrations(data);
        setLoading(false);
      })
      .catch(err => {
        setErrorMsg("Failed to load registrations.");
        setLoading(false);
      });
  };

  useEffect(() => {
    loadRegistrations();
  }, [user.dept_id]);

  // Client-side rule checking for Solo Edit
  useEffect(() => {
    if (!editingReg || editingReg.type !== "solo" || !soloDeptNum) {
      setRulesDisclaimer("");
      return;
    }

    const deptNumClean = soloDeptNum.trim();
    if (!deptNumClean) {
      setRulesDisclaimer("");
      return;
    }

    // Check event count for this student ID (excluding the current registration we are editing)
    let eventCount = 0;
    registrations.forEach(r => {
      if (r.registration_id === editingReg.registration_id) return;
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
      setRulesDisclaimer(`Warning: Student '${deptNumClean}' is already in ${eventCount} other events. Submitting will violate the 4-event limit rule.`);
      return;
    }

    setRulesDisclaimer("");
  }, [soloDeptNum, editingReg, registrations]);

  const handleDelete = (regId) => {
    setPopup({
      isOpen: true,
      type: "confirm",
      title: "Delete Registration",
      message: "Are you sure you want to delete this registration? All athlete details will be removed and you will need to register again.",
      onConfirm: () => proceedDelete(regId)
    });
  };

  const proceedDelete = async (regId) => {
    setErrorMsg("");
    setSuccessMsg("");
    
    try {
      const res = await fetch(`/api/registration/delete/${regId}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (res.ok) {
        setPopup({
          isOpen: true,
          type: "success",
          title: "Deleted",
          message: "Registration deleted successfully."
        });
        loadRegistrations();
      } else {
        setPopup({
          isOpen: true,
          type: "danger",
          title: "Delete Failed",
          message: data.detail || "Failed to delete registration."
        });
      }
    } catch (err) {
      setPopup({
        isOpen: true,
        type: "danger",
        title: "Connection Error",
        message: "Failed to connect to backend server."
      });
    }
  };

  const handleEditClick = (reg) => {
    setEditingReg(reg);
    setErrorMsg("");
    setSuccessMsg("");
    
    if (reg.type === "solo") {
      setSoloName(reg.student_name);
      setSoloDeptNum(reg.student_id);
      setSoloGender(reg.gender);
    } else {
      setTeamLeaderName(reg.team_leader.name);
      setTeamLeaderDeptNum(reg.team_leader.dept_num);
      setTeamMembers([...reg.members]);
      setMemberName("");
      setMemberDeptNum("");
      
      // Default memberGender to the gender of the first member or event division
      const defaultTeamGender = reg.members && reg.members.length > 0 
        ? reg.members[0].gender 
        : (reg.gender || "male");
      setMemberGender(defaultTeamGender);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    let payload = {
      event_id: editingReg.event_id,
      department_id: user.dept_id,
      type: editingReg.type
    };

    if (editingReg.type === "solo") {
      if (!soloName || !soloDeptNum) {
        setErrorMsg("Please fill in all details.");
        return;
      }
      payload.student_id = soloDeptNum.trim();
      payload.student_name = soloName.trim();
      payload.gender = soloGender;
    } else {
      const targetSize = editingReg.max_members || 4;
      if (!teamLeaderName || !teamLeaderDeptNum || teamMembers.length !== (targetSize - 1)) {
        setErrorMsg(`Roster must have exactly ${targetSize} members (1 leader and ${targetSize - 1} members).`);
        return;
      }
      payload.team_leader = {
        name: teamLeaderName.trim(),
        dept_num: teamLeaderDeptNum.trim()
      };
      payload.members = teamMembers;
    }

    try {
      const res = await fetch(`/api/registration/edit/${editingReg.registration_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg("Registration updated successfully.");
        setEditingReg(null);
        loadRegistrations();
      } else {
        setErrorMsg(data.detail || "Failed to update registration.");
      }
    } catch (err) {
      setErrorMsg("Failed to connect to server.");
    }
  };

  const handleAddMember = (e) => {
    e.preventDefault();
    if (!memberName || !memberDeptNum) return;

    const isDup = teamMembers.some(m => m.dept_num === memberDeptNum.trim()) || (teamLeaderDeptNum.trim() === memberDeptNum.trim());
    if (isDup) {
      setErrorMsg("Athlete already in the team.");
      return;
    }

    setTeamMembers([...teamMembers, {
      name: memberName.trim(),
      dept_num: memberDeptNum.trim(),
      gender: memberGender
    }]);
    setMemberName("");
    setMemberDeptNum("");
    setErrorMsg("");
  };

  if (loading) {
    return <div style={{ padding: "40px", textAlign: "center", color: "var(--color-text-muted)" }}>Loading registrations...</div>;
  }

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "28px", color: "var(--color-primary)", marginBottom: "4px" }}>
          Registered Participants
        </h1>
        <p style={{ color: "var(--color-text-muted)", fontSize: "14px" }}>
          View, edit, or delete sports events registered by your department
        </p>
      </div>

      <CustomPopup
        isOpen={popup.isOpen}
        type={popup.type}
        title={popup.title}
        message={popup.message}
        onClose={() => setPopup({ ...popup, isOpen: false })}
      />

      {/* Edit View Overlay Modal */}
      {editingReg && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ width: editingReg.type === "team" ? "800px" : "500px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "1px solid var(--color-border)", paddingBottom: "12px" }}>
              <h2 style={{ color: "var(--color-primary)" }}>
                Edit Registration: {editingReg.event_name}
              </h2>
              <button onClick={() => setEditingReg(null)} style={{ background: "transparent", border: "none", fontSize: "20px", cursor: "pointer", color: "var(--color-text-muted)" }}>
                &times;
              </button>
            </div>

            {editingReg.type === "solo" ? (
              // Solo Edit form
              <form onSubmit={handleEditSubmit}>
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
                    onChange={e => setSoloDeptNum(e.target.value.toUpperCase())}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={soloGender === "female" ? "Female" : "Male"} 
                    disabled 
                    style={{ backgroundColor: "#f1f5f9", cursor: "not-allowed" }}
                  />
                </div>

                {rulesDisclaimer && (
                  <div style={{ padding: "12px", backgroundColor: "#fffbeb", border: "1px solid #fef3c7", color: "var(--color-warning)", borderRadius: "var(--radius-md)", fontSize: "13px", fontWeight: 600, marginBottom: "16px" }}>
                    <ShieldAlert size={14} style={{ inlineSize: "14px", verticalAlign: "middle", marginRight: "6px" }} />
                    {rulesDisclaimer}
                  </div>
                )}

                <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
                  <button type="button" className="btn-secondary" onClick={() => setEditingReg(null)} style={{ flex: 1 }}>Cancel</button>
                  <button type="submit" className="btn-primary" style={{ flex: 1 }}>Save Changes</button>
                </div>
              </form>
            ) : (
              // Team Edit form
              <form onSubmit={handleEditSubmit}>
                <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "24px" }}>
                  <div>
                    <h3 style={{ fontSize: "15px", marginBottom: "12px", color: "var(--color-primary)" }}>Team Member (Leader)</h3>
                    <div className="form-group">
                      <label className="form-label">Name</label>
                      <input type="text" className="form-input" value={teamLeaderName} onChange={e => setTeamLeaderName(e.target.value)} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Dept Number</label>
                      <input type="text" className="form-input" value={teamLeaderDeptNum} onChange={e => setTeamLeaderDeptNum(e.target.value.toUpperCase())} required />
                    </div>

                    <h3 style={{ fontSize: "15px", marginTop: "20px", marginBottom: "12px", color: "var(--color-primary)" }}>Add Member</h3>
                    {teamMembers.length >= ((editingReg.max_members || 4) - 1) ? (
                      <p style={{ color: "var(--color-success)", fontSize: "13px", fontWeight: 600 }}>Roster full ({editingReg.max_members || 4} athletes registered)</p>
                    ) : (
                      <>
                        <div className="form-group">
                          <label className="form-label">Member Name</label>
                          <input type="text" className="form-input" value={memberName} onChange={e => setMemberName(e.target.value)} />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Dept Number</label>
                          <input type="text" className="form-input" value={memberDeptNum} onChange={e => setMemberDeptNum(e.target.value.toUpperCase())} />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Gender</label>
                          <input 
                            type="text" 
                            className="form-input" 
                            value={memberGender === "female" ? "Female" : "Male"} 
                            disabled 
                            style={{ backgroundColor: "#f1f5f9", cursor: "not-allowed" }}
                          />
                        </div>
                        <button type="button" className="btn-secondary" onClick={handleAddMember} style={{ width: "100%" }}>Add Member</button>
                      </>
                    )}
                  </div>

                  {/* List preview on the right */}
                  <div style={{ backgroundColor: "#f8fafc", padding: "20px", borderRadius: "var(--radius-md)" }}>
                    <h4 style={{ borderBottom: "1px solid var(--color-border)", paddingBottom: "6px", marginBottom: "12px" }}>Roster Preview (Edit Inline)</h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      <div style={{ padding: "8px 12px", backgroundColor: "#eff6ff", borderRadius: "var(--radius-sm)", display: "flex", flexDirection: "column", gap: "6px" }}>
                        <p style={{ fontSize: "9px", fontWeight: 800, color: "var(--color-primary)", textTransform: "uppercase" }}>Member #1 (Leader)</p>
                        <input 
                          type="text" 
                          className="form-input" 
                          style={{ padding: "4px 8px", fontSize: "12px", height: "28px", backgroundColor: "white" }} 
                          value={teamLeaderName} 
                          onChange={e => setTeamLeaderName(e.target.value)} 
                        />
                        <input 
                          type="text" 
                          className="form-input" 
                          style={{ padding: "4px 8px", fontSize: "12px", height: "28px", backgroundColor: "white" }} 
                          value={teamLeaderDeptNum} 
                          onChange={e => setTeamLeaderDeptNum(e.target.value.toUpperCase())} 
                        />
                      </div>
                      
                      {teamMembers.map((m, i) => (
                        <div key={i} style={{ padding: "8px 12px", backgroundColor: "white", border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", display: "flex", flexDirection: "column", gap: "6px", position: "relative" }}>
                          <p style={{ fontSize: "9px", fontWeight: 800, color: "var(--color-text-muted)" }}>MEMBER #{i+2}</p>
                          <input 
                            type="text" 
                            className="form-input" 
                            style={{ padding: "4px 8px", fontSize: "12px", height: "28px" }} 
                            value={m.name} 
                            onChange={e => {
                              const updated = [...teamMembers];
                              updated[i].name = e.target.value;
                              setTeamMembers(updated);
                            }} 
                          />
                          <input 
                            type="text" 
                            className="form-input" 
                            style={{ padding: "4px 8px", fontSize: "12px", height: "28px" }} 
                            value={m.dept_num} 
                            onChange={e => {
                              const updated = [...teamMembers];
                              updated[i].dept_num = e.target.value;
                              setTeamMembers(updated);
                            }} 
                          />
                          <button 
                            type="button" 
                            style={{ position: "absolute", top: "6px", right: "8px", border: "none", background: "none", color: "var(--color-danger)", cursor: "pointer", fontSize: "11px", fontWeight: 700 }}
                            onClick={() => {
                              const updated = [...teamMembers];
                              updated.splice(i, 1);
                              setTeamMembers(updated);
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                 <div style={{ display: "flex", gap: "12px", marginTop: "32px" }}>
                  <button type="button" className="btn-secondary" onClick={() => setEditingReg(null)} style={{ flex: 1 }}>Cancel</button>
                  <button type="submit" className="btn-primary" style={{ flex: 1 }} disabled={teamMembers.length !== ((editingReg.max_members || 4) - 1)}>Save Roster</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Registrations List */}
      {registrations.length === 0 ? (
        <div className="card" style={{ padding: "48px", textAlign: "center", color: "var(--color-text-muted)" }}>
          <p style={{ fontSize: "16px", marginBottom: "16px" }}>No registrations made yet.</p>
          <button className="btn-primary" onClick={() => onNavigate("register")} style={{ display: "inline-flex" }}>
            Go Register Athlete
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
          {registrations.map((reg) => (
            <div key={reg.registration_id} className="card animate-fade-in" style={{ padding: "24px" }}>
              {/* Card Title Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--color-border)", paddingBottom: "16px", marginBottom: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ backgroundColor: "#eff6ff", padding: "10px", borderRadius: "var(--radius-md)" }}>
                    {reg.type === "solo" ? <User size={20} color="var(--color-primary)" /> : <Users size={20} color="var(--color-primary-light)" />}
                  </div>
                  <div>
                    <h3 style={{ fontSize: "18px" }}>{reg.event_name}</h3>
                    <span className={`event-card-badge ${reg.type === "solo" ? "badge-solo" : "badge-team"}`}>
                      {reg.type} Event
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  <button className="btn-secondary" style={{ padding: "8px 12px" }} onClick={() => handleEditClick(reg)}>
                    <Edit size={14} /> Edit
                  </button>
                  <button className="btn-secondary" style={{ padding: "8px 12px", border: "1px solid #fee2e2", color: "var(--color-danger)" }} onClick={() => handleDelete(reg.registration_id)}>
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>

              {/* Card Roster Body */}
              <div>
                {reg.type === "solo" ? (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
                    <div>
                      <p style={{ fontSize: "11px", fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>Athlete Name</p>
                      <p style={{ fontWeight: 700, fontSize: "15px" }}>{reg.student_name}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: "11px", fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>Department Number</p>
                      <p style={{ fontWeight: 700, fontSize: "15px" }}>{reg.student_id}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: "11px", fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>Gender</p>
                      <p style={{ fontWeight: 700, fontSize: "15px", textTransform: "capitalize" }}>{reg.gender}</p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p style={{ fontSize: "11px", fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", marginBottom: "8px" }}>
                      Roster ({reg.max_members || 4} Members)
                    </p>
                    
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "16px" }}>
                      {/* Leader Box */}
                      <div style={{ padding: "12px", backgroundColor: "#f8fafc", border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)" }}>
                        <span style={{ fontSize: "9px", fontWeight: 800, color: "var(--color-primary)", textTransform: "uppercase" }}>Member (Leader)</span>
                        <p style={{ fontWeight: 700, fontSize: "14px" }}>{reg.team_leader?.name}</p>
                        <p style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>{reg.team_leader?.dept_num}</p>
                      </div>

                      {/* Members */}
                      {reg.members?.map((m, idx) => (
                        <div key={idx} style={{ padding: "12px", backgroundColor: "white", border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)" }}>
                          <span style={{ fontSize: "9px", fontWeight: 800, color: "var(--color-text-muted)", textTransform: "uppercase" }}>Member #{idx+1}</span>
                          <p style={{ fontWeight: 700, fontSize: "14px" }}>{m.name}</p>
                          <p style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>{m.dept_num}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
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

export default ViewParticipant;
