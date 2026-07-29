import React from "react";
import { CheckCircle, AlertCircle, HelpCircle } from "lucide-react";

function CustomPopup({ isOpen, type, title, message, onClose, onConfirm }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }}>
      <div 
        className="modal-content animate-scale-up" 
        style={{ 
          maxWidth: "400px", 
          textAlign: "center", 
          padding: "32px 24px", 
          borderRadius: "var(--radius-lg)",
          boxShadow: "var(--shadow-premium)",
          border: "1px solid var(--color-border)"
        }}
      >
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
          {type === "success" ? (
            <div style={{ backgroundColor: "#dcfce7", padding: "16px", borderRadius: "50%", color: "#16a34a" }}>
              <CheckCircle size={40} />
            </div>
          ) : type === "confirm" ? (
            <div style={{ backgroundColor: "#ffedd5", padding: "16px", borderRadius: "50%", color: "#ea580c" }}>
              <HelpCircle size={40} />
            </div>
          ) : (
            <div style={{ backgroundColor: "#fee2e2", padding: "16px", borderRadius: "50%", color: "#dc2626" }}>
              <AlertCircle size={40} />
            </div>
          )}
        </div>

        <h3 style={{ fontSize: "20px", color: "var(--color-text-dark)", marginBottom: "8px", fontWeight: 700 }}>
          {title}
        </h3>
        
        <p style={{ color: "var(--color-text-muted)", fontSize: "14px", marginBottom: "28px", lineHeight: "1.6" }}>
          {message}
        </p>

        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
          {type === "confirm" ? (
            <>
              <button 
                type="button" 
                className="btn-secondary" 
                onClick={onClose} 
                style={{ flex: 1, padding: "12px" }}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn-primary" 
                onClick={() => {
                  onConfirm();
                  onClose();
                }} 
                style={{ flex: 1, padding: "12px", backgroundColor: "#dc2626", backgroundImage: "none" }}
              >
                Confirm
              </button>
            </>
          ) : (
            <button 
              type="button" 
              className="btn-primary" 
              onClick={onClose} 
              style={{ width: "100%", padding: "12px" }}
            >
              OK
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default CustomPopup;
