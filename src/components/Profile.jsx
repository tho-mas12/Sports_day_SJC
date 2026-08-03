import React, { useState, useEffect } from "react";
import { User, Phone, Check, Edit2, ShieldCheck, Key } from "lucide-react";
import CustomPopup from "./CustomPopup";

function Profile({ user }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Edit fields
  const [viceName, setViceName] = useState("");
  const [vicePhone, setVicePhone] = useState("");
  const [studentName, setStudentName] = useState("");
  const [studentPhone, setStudentPhone] = useState("");

  // Password fields
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Popup state
  const [popup, setPopup] = useState({
    isOpen: false,
    type: "success",
    title: "",
    message: ""
  });

  const loadProfile = () => {
    setLoading(true);
    fetch(`/api/department/${user.dept_id}/profile`)
      .then(res => {
        if (!res.ok) throw new Error("Failed to load profile");
        return res.json();
      })
      .then(data => {
        setProfile(data);
        setViceName(data.vice_secretary?.name || "");
        setVicePhone(data.vice_secretary?.phone || "");
        setStudentName(data.student_secretary?.name || "");
        setStudentPhone(data.student_secretary?.phone || "");
        setLoading(false);
      })
      .catch(err => {
        setErrorMsg("Failed to load department profile.");
        setLoading(false);
      });
  };

  useEffect(() => {
    loadProfile();
  }, [user.dept_id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!viceName || !vicePhone || !studentName || !studentPhone) {
      setErrorMsg("All secretary fields are mandatory.");
      return;
    }

    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(vicePhone.trim())) {
      setErrorMsg("Staff Secretary mobile number must be exactly 10 digits.");
      return;
    }
    if (!phoneRegex.test(studentPhone.trim())) {
      setErrorMsg("Student Secretary mobile number must be exactly 10 digits.");
      return;
    }

    try {
      const res = await fetch(`/api/department/${user.dept_id}/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vice_name: viceName,
          vice_phone: vicePhone,
          student_name: studentName,
          student_phone: studentPhone
        })
      });
      const data = await res.json();
      if (res.ok) {
        setPopup({
          isOpen: true,
          type: "success",
          title: "Profile Updated",
          message: "Secretary details updated successfully."
        });
        setIsEditing(false);
        loadProfile();
      } else {
        setErrorMsg(data.detail || "Failed to update profile.");
      }
    } catch (err) {
      setErrorMsg("Failed to connect to backend server.");
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError("");

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    if (newPassword.length < 4) {
      setPasswordError("Password must be at least 4 characters long.");
      return;
    }

    try {
      const res = await fetch(`/api/department/${user.dept_id}/password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ new_password: newPassword })
      });
      const data = await res.json();
      if (res.ok) {
        setPopup({
          isOpen: true,
          type: "success",
          title: "Password Updated",
          message: "Your login password has been changed successfully."
        });
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setPasswordError(data.detail || "Failed to update password.");
      }
    } catch (err) {
      setPasswordError("Failed to connect to server.");
    }
  };

  if (loading) {
    return <div style={{ padding: "40px", textAlign: "center", color: "var(--color-text-muted)" }}>Loading profile...</div>;
  }

  return (
    <div className="animate-fade-in" style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "32px" }}>
      {/* Secretary Details Side */}
      <div>
        <div style={{ marginBottom: "32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ fontSize: "28px", color: "var(--color-primary)", marginBottom: "4px" }}>
              Department Profile
            </h1>
            <p style={{ color: "var(--color-text-muted)", fontSize: "14px" }}>
              View and manage department secretary contact information
            </p>
          </div>
          {!isEditing && (
            <button className="btn-primary" onClick={() => setIsEditing(true)}>
              <Edit2 size={16} /> Edit Info
            </button>
          )}
        </div>

        {errorMsg && (
          <div style={{ padding: "14px", backgroundColor: "#fef2f2", color: "var(--color-danger)", border: "1px solid #fee2e2", borderRadius: "var(--radius-md)", fontSize: "14px", marginBottom: "24px", fontWeight: 600 }}>
            {errorMsg}
          </div>
        )}

        <div className="card">
          {/* Read only info banner */}
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "1fr 1fr", 
            gap: "20px", 
            backgroundColor: "#f8fafc",
            padding: "20px",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--color-border)",
            marginBottom: "28px"
          }}>
            <div>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>Department Name</span>
              <p style={{ fontWeight: 700, color: "var(--color-primary)" }}>{profile.name}</p>
            </div>
            <div>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>Shift Assignment</span>
              <p style={{ fontWeight: 700, color: "var(--color-primary)" }}>Shift {profile.shift === 1 ? "I" : "II"}</p>
            </div>
            <div>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>Department ID</span>
              <p style={{ fontFamily: "monospace", fontWeight: 700 }}>{profile.dept_id}</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--color-success)", fontSize: "13px", fontWeight: 700 }}>
              <ShieldCheck size={16} /> Access Initialized
            </div>
          </div>

          {/* Secretary Details Form */}
          <form onSubmit={handleSubmit}>
            {/* Staff Secretary Section */}
            <h3 style={{ fontSize: "16px", color: "var(--color-primary-light)", borderBottom: "1px solid var(--color-border)", paddingBottom: "6px", marginBottom: "16px" }}>
              Staff Secretary Details
            </h3>
            
            <div className="form-group">
              <label className="form-label">Name</label>
              <input 
                type="text" 
                className="form-input" 
                value={viceName}
                onChange={e => setViceName(e.target.value)}
                disabled={!isEditing}
                required
              />
            </div>
            <div className="form-group" style={{ marginBottom: "28px" }}>
              <label className="form-label">Mobile Number</label>
              <input 
                type="tel" 
                className="form-input" 
                value={vicePhone}
                onChange={e => setVicePhone(e.target.value.replace(/\D/g, ""))}
                maxLength={10}
                disabled={!isEditing}
                required
              />
            </div>

            {/* Student Secretary Section */}
            <h3 style={{ fontSize: "16px", color: "var(--color-primary-light)", borderBottom: "1px solid var(--color-border)", paddingBottom: "6px", marginBottom: "16px" }}>
              Student Secretary Details
            </h3>
            
            <div className="form-group">
              <label className="form-label">Name</label>
              <input 
                type="text" 
                className="form-input" 
                value={studentName}
                onChange={e => setStudentName(e.target.value)}
                disabled={!isEditing}
                required
              />
            </div>
            <div className="form-group" style={{ marginBottom: "28px" }}>
              <label className="form-label">Mobile Number</label>
              <input 
                type="tel" 
                className="form-input" 
                value={studentPhone}
                onChange={e => setStudentPhone(e.target.value.replace(/\D/g, ""))}
                maxLength={10}
                disabled={!isEditing}
                required
              />
            </div>

            {isEditing && (
              <div style={{ display: "flex", gap: "12px", marginTop: "32px" }}>
                <button 
                  type="button" 
                  className="btn-secondary" 
                  onClick={() => {
                    setIsEditing(false);
                    loadProfile(); // Reset fields
                  }}
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                  <Check size={16} /> Save Secretary Info
                </button>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Password Management Side */}
      <div>
        <div style={{ marginBottom: "32px" }}>
          <h2 style={{ fontSize: "24px", color: "var(--color-primary)" }}>
            Security Settings
          </h2>
          <p style={{ color: "var(--color-text-muted)", fontSize: "14px" }}>
            Manage and update department login credentials
          </p>
        </div>

        {passwordError && (
          <div style={{ padding: "14px", backgroundColor: "#fef2f2", color: "var(--color-danger)", border: "1px solid #fee2e2", borderRadius: "var(--radius-md)", fontSize: "14px", marginBottom: "24px", fontWeight: 600 }}>
            {passwordError}
          </div>
        )}

        <div className="card">
          <form onSubmit={handlePasswordChange}>
            <h3 style={{ fontSize: "16px", color: "var(--color-primary-light)", borderBottom: "1px solid var(--color-border)", paddingBottom: "6px", marginBottom: "16px" }}>
              Change Password
            </h3>

            <div className="form-group">
              <label className="form-label">New Password</label>
              <input 
                type="password" 
                className="form-input" 
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: "24px" }}>
              <label className="form-label">Confirm New Password</label>
              <input 
                type="password" 
                className="form-input" 
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn-primary" style={{ width: "100%", padding: "12px" }}>
              <Key size={16} style={{ display: "inline-block", marginRight: "6px", verticalAlign: "middle" }} />
              Update Password
            </button>
          </form>
        </div>
      </div>

      {/* Custom Popup Modal */}
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

export default Profile;
