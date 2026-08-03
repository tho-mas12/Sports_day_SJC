import React, { useState, useEffect } from "react";
import { Calendar, Save, Loader2, Trash2 } from "lucide-react";
import CustomPopup from "./CustomPopup";

function AdminActiveYear() {
  const [activeYear, setActiveYear] = useState("");
  const [inputYear, setInputYear] = useState("");
  const [yearsList, setYearsList] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Custom Popup State
  const [popup, setPopup] = useState({
    isOpen: false,
    type: "success",
    title: "",
    message: "",
    onConfirm: null
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const activeRes = await fetch("/api/admin/active-year");
      const activeData = await activeRes.json();

      const listRes = await fetch("/api/admin/years");
      const listData = await listRes.json();

      if (activeRes.ok && listRes.ok) {
        setActiveYear(activeData.active_year);
        setInputYear(activeData.active_year);
        setYearsList(listData.years || []);
      } else {
        setPopup({
          isOpen: true,
          type: "danger",
          title: "Error",
          message: "Failed to load active year or years list."
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
    loadData();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!inputYear.trim()) {
      setPopup({
        isOpen: true,
        type: "danger",
        title: "Invalid Input",
        message: "Active year cannot be empty."
      });
      return;
    }

    try {
      const res = await fetch("/api/admin/active-year", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ year: inputYear.trim() })
      });
      const data = await res.json();
      if (res.ok) {
        setActiveYear(inputYear.trim());
        setPopup({
          isOpen: true,
          type: "success",
          title: "System Updated",
          message: `Active year changed to ${inputYear.trim()} successfully! Registrations data is isolated for this year.`
        });
        // Refresh the list to include the newly registered year
        const listRes = await fetch("/api/admin/years");
        const listData = await listRes.json();
        if (listRes.ok) {
          setYearsList(listData.years || []);
        }
      } else {
        setPopup({
          isOpen: true,
          type: "danger",
          title: "Failed to Save",
          message: data.detail || "Failed to update active year."
        });
      }
    } catch (err) {
      setPopup({
        isOpen: true,
        type: "danger",
        title: "Connection Error",
        message: "Failed to save active year."
      });
    }
  };

  const handleYearClick = (yearToSet) => {
    if (yearToSet === activeYear) return;
    setPopup({
      isOpen: true,
      type: "confirm",
      title: "Switch Active Year",
      message: `Are you sure you want to change the active year to ${yearToSet}? Registrations data will load for this year.`,
      onConfirm: () => executeSwitch(yearToSet)
    });
  };

  const executeSwitch = async (yearToSet) => {
    try {
      const res = await fetch("/api/admin/active-year", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ year: yearToSet })
      });
      const data = await res.json();
      if (res.ok) {
        setActiveYear(yearToSet);
        setInputYear(yearToSet);
        setPopup({
          isOpen: true,
          type: "success",
          title: "Switch Successful",
          message: `Active year successfully changed to ${yearToSet}.`
        });
      } else {
        setPopup({
          isOpen: true,
          type: "danger",
          title: "Failed to Switch",
          message: data.detail || "Failed to switch active year."
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

  const handleDeleteClick = (yearToDelete) => {
    if (yearToDelete === activeYear) return;
    setPopup({
      isOpen: true,
      type: "confirm",
      title: "Delete Year",
      message: `Are you sure you want to delete Year ${yearToDelete}? This action only removes it from the list of years.`,
      onConfirm: () => executeDelete(yearToDelete)
    });
  };

  const executeDelete = async (yearToDelete) => {
    try {
      const res = await fetch(`/api/admin/year/${yearToDelete}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (res.ok) {
        setPopup({
          isOpen: true,
          type: "success",
          title: "Delete Successful",
          message: `Year ${yearToDelete} successfully deleted.`
        });
        loadData();
      } else {
        setPopup({
          isOpen: true,
          type: "danger",
          title: "Failed to Delete",
          message: data.detail || "Failed to delete year."
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

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "var(--color-text-muted)" }}>
        <Loader2 className="animate-spin" style={{ display: "inline-block", marginRight: "8px" }} />
        Loading configuration...
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "32px" }}>
      {/* Settings Form Column */}
      <div>
        <div style={{ marginBottom: "32px" }}>
          <h1 style={{ fontSize: "28px", color: "var(--color-primary)", marginBottom: "4px" }}>
            Active Year Configuration
          </h1>
          <p style={{ color: "var(--color-text-muted)", fontSize: "14px" }}>
            Configure and manage the system active competition year.
          </p>
        </div>

        {/* Main Settings Card */}
        <div className="card">
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "16px",
            backgroundColor: "#eff6ff",
            border: "1px solid #dbeafe",
            padding: "20px",
            borderRadius: "var(--radius-md)",
            marginBottom: "28px"
          }}>
            <div style={{ backgroundColor: "var(--color-primary-light)", padding: "12px", borderRadius: "var(--radius-md)", color: "white" }}>
              <Calendar size={24} />
            </div>
            <div>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>Current Active Year</span>
              <h2 style={{ fontSize: "24px", color: "var(--color-primary)", margin: 0, fontWeight: 800 }}>
                {activeYear}
              </h2>
            </div>
          </div>

          <form onSubmit={handleSave}>
            <div className="form-group" style={{ marginBottom: "24px" }}>
              <label className="form-label">Update Active Year</label>
              <input 
                type="text" 
                className="form-input" 
                value={inputYear} 
                onChange={e => setInputYear(e.target.value)}
                required
              />
              <p style={{ fontSize: "12px", color: "var(--color-text-muted)", marginTop: "6px" }}>
                💡 Switching years isolates students' registration data. Events and departments configurations remain default.
              </p>
            </div>

            <button type="submit" className="btn-primary" style={{ width: "100%", padding: "12px" }}>
              <Save size={16} style={{ display: "inline-block", marginRight: "6px", verticalAlign: "middle" }} />
              Register & Save Year
            </button>
          </form>
        </div>
      </div>

      {/* Registered Years Column */}
      <div>
        <div style={{ marginBottom: "32px" }}>
          <h2 style={{ fontSize: "24px", color: "var(--color-primary)", marginBottom: "4px" }}>
            Registered Years
          </h2>
          <p style={{ color: "var(--color-text-muted)", fontSize: "14px" }}>
            Click on a year below to activate its records instantly.
          </p>
        </div>

        <div className="card" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {yearsList.map(y => (
            <div
              key={y}
              style={{
                width: "100%",
                padding: "16px 20px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                border: y === activeYear ? "2px solid var(--color-primary)" : "1px solid var(--color-border)",
                borderRadius: "var(--radius-md)",
                backgroundColor: y === activeYear ? "#eff6ff" : "white",
              }}
            >
              <span style={{ fontSize: "15px", fontWeight: y === activeYear ? 800 : 500, color: y === activeYear ? "var(--color-primary)" : "var(--color-text-dark)" }}>
                Year {y}
              </span>
              
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                {y === activeYear ? (
                  <span style={{ fontSize: "11px", backgroundColor: "var(--color-primary)", color: "white", padding: "6px 12px", borderRadius: "var(--radius-sm)", fontWeight: 700 }}>
                    Active Year
                  </span>
                ) : (
                  <>
                    <button 
                      className="btn-secondary" 
                      style={{ padding: "6px 12px", fontSize: "12px", border: "1px solid var(--color-border)" }}
                      onClick={() => handleYearClick(y)}
                    >
                      Set Active
                    </button>
                    <button 
                      className="btn-secondary" 
                      style={{ padding: "6px 10px", border: "1px solid #fee2e2", color: "var(--color-danger)" }}
                      onClick={() => handleDeleteClick(y)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Impressive Custom Popup */}
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

export default AdminActiveYear;
