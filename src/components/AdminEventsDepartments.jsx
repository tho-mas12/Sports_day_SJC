import React, { useState, useEffect } from "react";
import { Plus, Edit3, Trash2, CalendarRange, Landmark, RefreshCw, Eye, EyeOff } from "lucide-react";
import CustomPopup from "./CustomPopup";

function AdminEventsDepartments() {
  const [activeTab, setActiveTab] = useState("events"); // "events" or "departments"
  const [events, setEvents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Custom Popup State
  const [popup, setPopup] = useState({
    isOpen: false,
    type: "success",
    title: "",
    message: "",
    onConfirm: null
  });

  // Modal control states
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Form states
  const [itemId, setItemId] = useState("");
  const [itemName, setItemName] = useState("");
  const [eventType, setEventType] = useState("solo"); // "solo", "team", "others"
  const [eventGender, setEventGender] = useState("boys");
  const [otherDetails, setOtherDetails] = useState(""); // details for "others" type
  const [maxMembers, setMaxMembers] = useState(1); // participant count
  const [deptShift, setDeptShift] = useState(1);
  const [maxRegistrations, setMaxRegistrations] = useState(3);

  const loadData = async () => {
    try {
      setLoading(true);
      const evRes = await fetch(`/api/admin/events?_=${Date.now()}`);
      const evData = await evRes.json();
      
      const deptRes = await fetch(`/api/admin/departments?_=${Date.now()}`);
      const deptData = await deptRes.json();

      if (evRes.ok && deptRes.ok) {
        setEvents(evData);
        setDepartments(deptData);
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

  const openAddModal = () => {
    setEditingItem(null);
    setItemId("");
    setItemName("");
    setEventType("solo");
    setEventGender("boys");
    setOtherDetails("");
    setMaxMembers(1);
    setMaxRegistrations(3);
    setDeptShift(1);
    setErrorMsg("");
    setSuccessMsg("");
    setShowAddModal(true);
  };

  const isExceptedEventName = (name) => {
    const clean = name.toLowerCase().replace(/mts/g, "mts.").replace(/\s+/g, " ").trim();
    const exceptions = ["800 mts. race", "1500 mts. race", "5000 mts. race", "10,000 mts. race", "20 km walk", "800 mts race", "1500 mts race", "5000 mts race", "10000 mts race", "20km walk"];
    return exceptions.some(ex => clean.includes(ex));
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setItemId(item._id);
    setItemName(item.name);
    if (activeTab === "events") {
      setEventType(item.type);
      setEventGender(item.gender);
      setOtherDetails(item.other_details || "");
      setMaxMembers(item.max_members || 1);
      
      let defaultRegs = 3;
      if (item.type === "team") {
        defaultRegs = 1;
      } else if (isExceptedEventName(item.name)) {
        defaultRegs = 9999;
      }
      
      setMaxRegistrations(item.type === "solo" ? (item.max_members !== undefined ? item.max_members : defaultRegs) : 1);
    } else {
      setDeptShift(item.shift);
    }
    setErrorMsg("");
    setSuccessMsg("");
    setShowAddModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!itemId || !itemName) {
      setErrorMsg("Please fill in ID and Name.");
      return;
    }

    const isEdit = !!editingItem;
    const url = isEdit 
      ? `/api/admin/${activeTab}/${itemId}`
      : `/api/admin/${activeTab}`;
    const method = isEdit ? "PUT" : "POST";

    const body = activeTab === "events"
      ? { 
          id: itemId.trim(), 
          name: itemName.trim(), 
          type: eventType, 
          gender: eventGender,
          other_details: eventType === "others" ? otherDetails.trim() : "",
          max_members: eventType === "solo" ? parseInt(maxRegistrations) : parseInt(maxMembers) || 4,
          is_visible: editingItem ? editingItem.is_visible : true
        }
      : { id: itemId.trim(), name: itemName.trim(), shift: parseInt(deptShift) };

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(data.message || `${activeTab === "events" ? "Event" : "Department"} saved successfully.`);
        setShowAddModal(false);
        loadData();
      } else {
        setErrorMsg(data.detail || "Failed to save record.");
      }
    } catch (err) {
      setErrorMsg("Connection error.");
    }
  };

  const handleToggleVisibility = async (eventId, currentVisibility) => {
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const res = await fetch(`/api/admin/events/${eventId}/visibility`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_visible: !currentVisibility })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg("Visibility changed successfully.");
        loadData();
      } else {
        setErrorMsg(data.detail || "Failed to toggle visibility.");
      }
    } catch (err) {
      setErrorMsg("Failed to connect to backend server.");
    }
  };

  const handleDelete = (id) => {
    setPopup({
      isOpen: true,
      type: "confirm",
      title: `Delete ${activeTab === 'events' ? 'Event' : 'Department'}`,
      message: `Are you sure you want to delete this ${activeTab === 'events' ? 'event' : 'department'}? All related registrations will also be deleted!`,
      onConfirm: () => proceedDelete(id)
    });
  };

  const proceedDelete = async (id) => {
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch(`/api/admin/${activeTab}/${id}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (res.ok) {
        setPopup({
          isOpen: true,
          type: "success",
          title: "Deleted",
          message: data.message || "Record deleted successfully."
        });
        loadData();
      } else {
        setPopup({
          isOpen: true,
          type: "danger",
          title: "Failed to Delete",
          message: data.detail || "Failed to delete record."
        });
      }
    } catch (err) {
      setPopup({
        isOpen: true,
        type: "danger",
        title: "Error",
        message: "Failed to connect to backend server."
      });
    }
  };

  if (loading) {
    return <div style={{ padding: "40px", textAlign: "center", color: "var(--color-text-muted)" }}>Loading records...</div>;
  }

  return (
    <div className="animate-fade-in">
      {/* Header Row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <div>
          <h1 style={{ fontSize: "28px", color: "var(--color-primary)", marginBottom: "4px" }}>
            Add Events & Departments
          </h1>
          <p style={{ color: "var(--color-text-muted)", fontSize: "14px" }}>
            Manage sports events and collegiate departments roster
          </p>
        </div>
        <button className="btn-primary" onClick={openAddModal}>
          <Plus size={16} />
          {activeTab === "events" ? "Add Event" : "Add Department"}
        </button>
      </div>

      {/* Tabs list */}
      <div className="tab-container">
        <button 
          className={`tab-btn ${activeTab === "events" ? "active" : ""}`}
          onClick={() => { setActiveTab("events"); setErrorMsg(""); setSuccessMsg(""); }}
        >
          Sports Events ({events.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === "departments" ? "active" : ""}`}
          onClick={() => { setActiveTab("departments"); setErrorMsg(""); setSuccessMsg(""); }}
        >
          Departments ({departments.length})
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

      {/* Main Grid display */}
      {activeTab === "events" ? (
        <div className="event-grid">
          {events.map(ev => {
            const isVisible = ev.is_visible !== false;
            return (
              <div key={ev._id} className="event-card" style={{ padding: "20px", opacity: isVisible ? 1 : 0.75 }}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "12px" }}>
                  <span className={`event-card-badge ${ev.type === "solo" ? "badge-solo" : "badge-team"}`}>
                    {ev.type}
                  </span>
                  <span className={`event-card-badge ${ev.gender === "boys" ? "badge-boys" : "badge-girls"}`}>
                    {ev.gender}
                  </span>
                  <span className="event-card-badge" style={{ backgroundColor: isVisible ? "#e6f4ea" : "#fce8e6", color: isVisible ? "#137333" : "#c5221f" }}>
                    {isVisible ? "Visible" : "Hidden"}
                  </span>
                </div>
                <h3 style={{ fontSize: "16px", marginBottom: "4px" }}>{ev.name}</h3>
                <p style={{ fontSize: "11px", color: "var(--color-text-muted)", fontFamily: "monospace", marginBottom: "4px" }}>ID: {ev._id}</p>
                
                {ev.type === "others" && ev.other_details && (
                  <p style={{ fontSize: "12px", color: "var(--color-text-muted)", fontStyle: "italic", marginBottom: "4px" }}>
                    ({ev.other_details})
                  </p>
                )}

                {ev.type !== "solo" && (
                  <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--color-primary-light)", marginBottom: "16px" }}>
                    Athletes Limit: {ev.max_members || 4}
                  </p>
                )}

                <div style={{ display: "flex", gap: "8px", marginTop: "auto" }}>
                  <button className="btn-secondary" style={{ flex: 1, padding: "8px" }} onClick={() => openEditModal(ev)}>
                    <Edit3 size={14} /> Edit
                  </button>
                  
                  {/* Show/Hide Toggle Button */}
                  <button 
                    className="btn-secondary" 
                    style={{ 
                      flex: 1, 
                      padding: "8px", 
                      color: isVisible ? "var(--color-warning)" : "var(--color-success)",
                      borderColor: isVisible ? "#ffe0b2" : "#c8e6c9",
                      backgroundColor: isVisible ? "#fff3e0" : "#e8f5e9"
                    }}
                    onClick={() => handleToggleVisibility(ev._id, isVisible)}
                    title={isVisible ? "Hide event from departments" : "Show event to departments"}
                  >
                    {isVisible ? <EyeOff size={14} /> : <Eye size={14} />} {isVisible ? "Hide" : "Show"}
                  </button>

                  <button className="btn-secondary" style={{ border: "1px solid #fee2e2", color: "var(--color-danger)", flex: 0.3, padding: "8px" }} onClick={() => handleDelete(ev._id)}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="event-grid">
          {departments.map(dept => (
            <div key={dept._id} className="event-card" style={{ padding: "20px" }}>
                <span className={`event-card-badge ${dept.shift === 1 ? "badge-boys" : dept.shift === 2 ? "badge-girls" : "badge-solo"}`} style={{ backgroundColor: dept.shift === 3 ? "#fae8ff" : undefined, color: dept.shift === 3 ? "#a21caf" : undefined }}>
                  {dept.shift === 1 ? "Shift I (Boys)" : dept.shift === 2 ? "Shift II (Boys)" : "Girls Competition"}
                </span>
              <h3 style={{ fontSize: "16px", marginBottom: "4px" }}>{dept.name}</h3>
              <p style={{ fontSize: "11px", color: "var(--color-text-muted)", fontFamily: "monospace", marginBottom: "20px" }}>ID: {dept._id}</p>
              
              <div style={{ display: "flex", gap: "8px", marginTop: "auto" }}>
                <button className="btn-secondary" style={{ flex: 1, padding: "8px" }} onClick={() => openEditModal(dept)}>
                  <Edit3 size={14} /> Edit
                </button>
                <button className="btn-secondary" style={{ border: "1px solid #fee2e2", color: "var(--color-danger)", flex: 0.3, padding: "8px" }} onClick={() => handleDelete(dept._id)}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Overlay Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "1px solid var(--color-border)", paddingBottom: "12px" }}>
              <h2 style={{ color: "var(--color-primary)" }}>
                {editingItem ? "Edit Info" : "Create New Record"}
              </h2>
              <button onClick={() => setShowAddModal(false)} style={{ background: "transparent", border: "none", fontSize: "20px", cursor: "pointer", color: "var(--color-text-muted)" }}>
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Unique Code ID</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder={activeTab === "events" ? "e.g. b_100m" : "e.g. cs_s1"}
                  value={itemId}
                  onChange={e => setItemId(e.target.value)}
                  disabled={!!editingItem} // ID is key, cannot be edited
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Display Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder={activeTab === "events" ? "e.g. 100 Mts. Dash" : "e.g. Dept. of Computer Science"}
                  value={itemName}
                  onChange={e => setItemName(e.target.value)}
                  required
                />
              </div>

              {activeTab === "events" ? (
                // Event Extra Fields
                <>
                  <div className="form-group">
                    <label className="form-label">Event Type</label>
                    <select className="form-select" value={eventType} onChange={e => {
                      const val = e.target.value;
                      setEventType(val);
                      if (val === "solo") {
                        setMaxMembers(1);
                        setMaxRegistrations(3);
                      } else {
                        setMaxMembers(val === "team" ? 4 : 2);
                        setMaxRegistrations(1);
                      }
                    }}>
                      <option value="solo">Solo</option>
                      <option value="team">Team (Relays)</option>
                      <option value="others">Others</option>
                    </select>
                  </div>

                  {/* Dynamic detail input for others */}
                  {eventType === "others" && (
                    <div className="form-group">
                      <label className="form-label">Other Type details</label>
                      <input 
                        type="text"
                        className="form-input"
                        placeholder="Mention what event type this is..."
                        value={otherDetails}
                        onChange={e => setOtherDetails(e.target.value)}
                        required
                      />
                    </div>
                  )}

                  {/* Dynamic participant count limit box for team/others */}
                  {eventType !== "solo" && (
                    <div className="form-group">
                      <label className="form-label">Participant count limit (Roster size)</label>
                      <input 
                        type="number"
                        className="form-input"
                        placeholder="Enter number of athletes allowed in a team"
                        value={maxMembers}
                        onChange={e => setMaxMembers(Math.max(1, parseInt(e.target.value) || 1))}
                        min={1}
                        required
                      />
                    </div>
                  )}

                  {/* Participant registrations limit box for all events */}
                  <div className="form-group">
                    <label className="form-label">Participant slots limit per department (Slots Filled)</label>
                    <input 
                      type="number"
                      className="form-input"
                      placeholder="Enter slots limit (e.g. 3, or 9999 for unlimited)"
                      value={maxRegistrations}
                      onChange={e => setMaxRegistrations(Math.max(1, parseInt(e.target.value) || 1))}
                      min={1}
                      disabled={eventType !== "solo"}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Gender Restriction</label>
                    <select className="form-select" value={eventGender} onChange={e => setEventGender(e.target.value)}>
                      <option value="boys">Boys</option>
                      <option value="girls">Girls</option>
                    </select>
                  </div>
                </>
              ) : (
                // Department Extra Fields
                <div className="form-group">
                  <label className="form-label">Academic Shift</label>
                  <select className="form-select" value={deptShift} onChange={e => setDeptShift(e.target.value)}>
                    <option value={1}>Shift I (Day)</option>
                    <option value={2}>Shift II (Evening)</option>
                  </select>
                </div>
              )}

              <div style={{ display: "flex", gap: "12px", marginTop: "32px" }}>
                <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)} style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                  Save Record
                </button>
              </div>
            </form>
          </div>
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

export default AdminEventsDepartments;
