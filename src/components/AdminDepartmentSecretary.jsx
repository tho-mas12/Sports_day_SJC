import React, { useState, useEffect } from "react";
import { Users, FileSpreadsheet, FileText, Search, RefreshCw, Phone } from "lucide-react";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

function AdminDepartmentSecretary() {
  const [secretaries, setSecretaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [shiftFilter, setShiftFilter] = useState("all"); // "all", "1", "2"

  const loadSecretaries = () => {
    setLoading(true);
    fetch("http://localhost:8000/api/reports/secretaries")
      .then(res => {
        if (!res.ok) throw new Error("Failed to load secretaries");
        return res.json();
      })
      .then(data => {
        setSecretaries(data);
        setLoading(false);
      })
      .catch(err => {
        setErrorMsg("Failed to load secretary details.");
        setLoading(false);
      });
  };

  useEffect(() => {
    loadSecretaries();
  }, []);

  // Filter logic
  const filteredSecretaries = secretaries.filter(item => {
    const matchesShift = shiftFilter === "all" || item.shift.toString() === shiftFilter;
    
    const term = searchQuery.toLowerCase().trim();
    const matchesSearch = !term || 
      item.dept_name.toLowerCase().includes(term) ||
      (item.vice_secretary?.name || "").toLowerCase().includes(term) ||
      (item.vice_secretary?.phone || "").toLowerCase().includes(term) ||
      (item.student_secretary?.name || "").toLowerCase().includes(term) ||
      (item.student_secretary?.phone || "").toLowerCase().includes(term);

    return matchesShift && matchesSearch;
  });

  // Export Excel
  const handleExportExcel = () => {
    if (filteredSecretaries.length === 0) return;
    const dataToExport = filteredSecretaries.map((s, index) => ({
      "S.No": index + 1,
      "Department": s.dept_name,
      "Shift": s.shift === 1 ? "Shift I" : "Shift II",
      "Staff Secretary Name": s.vice_secretary?.name || "Not Entered",
      "Staff Secretary Mobile": s.vice_secretary?.phone || "Not Entered",
      "Student Secretary Name": s.student_secretary?.name || "Not Entered",
      "Student Secretary Mobile": s.student_secretary?.phone || "Not Entered"
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Secretaries");
    XLSX.writeFile(wb, "SJC_Sports_Day_Department_Secretaries.xlsx");
  };

  // Export PDF
  const handleExportPDF = () => {
    if (filteredSecretaries.length === 0) return;
    const doc = new jsPDF("l", "mm", "a4");
    
    doc.setFillColor(30, 64, 175);
    doc.rect(0, 0, 297, 30, "F");
    
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("ST. JOSEPH'S COLLEGE (AUTONOMOUS)", 14, 14);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text("Department Secretaries Directory Report", 14, 22);

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(10);
    doc.text(`Total Records: ${filteredSecretaries.length}`, 14, 40);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 230, 40);

    const headers = [["S.No", "Department", "Shift", "Staff Secretary", "Staff Secretary Mobile", "Student Secretary", "Student Secretary Mobile"]];
    const data = filteredSecretaries.map((s, idx) => [
      idx + 1,
      s.dept_name,
      s.shift === 1 ? "Shift I" : "Shift II",
      s.vice_secretary?.name || "N/A",
      s.vice_secretary?.phone || "N/A",
      s.student_secretary?.name || "N/A",
      s.student_secretary?.phone || "N/A"
    ]);

    autoTable(doc, {
      head: headers,
      body: data,
      startY: 46,
      theme: "striped",
      styles: { fontSize: 9, font: "helvetica" },
      headStyles: { fillColor: [30, 64, 175] }
    });

    doc.save("SJC_Sports_Day_Department_Secretaries.pdf");
  };

  if (loading) {
    return <div style={{ padding: "40px", textAlign: "center", color: "var(--color-text-muted)" }}>Loading directory...</div>;
  }

  return (
    <div className="animate-fade-in">
      {/* Header Banner */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <div>
          <h1 style={{ fontSize: "28px", color: "var(--color-primary)", marginBottom: "4px" }}>
            Department Secretaries
          </h1>
          <p style={{ color: "var(--color-text-muted)", fontSize: "14px" }}>
            View contact details of Staff Secretaries and Student Secretaries for each department
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          <button 
            className="btn-secondary" 
            onClick={handleExportExcel}
            disabled={filteredSecretaries.length === 0}
            style={{ color: "#166534", border: "1px solid #bbf7d0", backgroundColor: "#f0fdf4" }}
          >
            <FileSpreadsheet size={16} /> Excel Export
          </button>
          <button 
            className="btn-secondary" 
            onClick={handleExportPDF}
            disabled={filteredSecretaries.length === 0}
            style={{ color: "#991b1b", border: "1px solid #fecaca", backgroundColor: "#fef2f2" }}
          >
            <FileText size={16} /> PDF Export
          </button>
        </div>
      </div>

      {errorMsg && (
        <div style={{ padding: "14px", backgroundColor: "#fef2f2", color: "var(--color-danger)", border: "1px solid #fee2e2", borderRadius: "var(--radius-md)", fontSize: "14px", marginBottom: "24px", fontWeight: 600 }}>
          {errorMsg}
        </div>
      )}

      {/* Filters bar */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "1fr 200px", 
        gap: "16px",
        marginBottom: "28px"
      }}>
        {/* Search */}
        <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
          <Search size={18} style={{ position: "absolute", left: "14px", color: "var(--color-text-muted)" }} />
          <input 
            type="text" 
            className="form-input" 
            placeholder="Search by department name, secretary name or mobile number..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ paddingLeft: "42px" }}
          />
        </div>
        
        {/* Shift selector */}
        <select 
          className="form-select" 
          value={shiftFilter} 
          onChange={e => setShiftFilter(e.target.value)}
        >
          <option value="all">All Shifts</option>
          <option value="1">Shift I</option>
          <option value="2">Shift II</option>
        </select>
      </div>

      {/* Directory Table */}
      <div className="table-container animate-fade-in">
        <table className="custom-table">
          <thead>
            <tr>
              <th>S.No</th>
              <th>Department Name</th>
              <th>Shift</th>
              <th>Staff Secretary Details</th>
              <th>Student Secretary Details</th>
            </tr>
          </thead>
          <tbody>
            {filteredSecretaries.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: "center", padding: "40px", color: "var(--color-text-muted)" }}>
                  No secretary contacts found.
                </td>
              </tr>
            ) : (
              filteredSecretaries.map((s, idx) => (
                <tr key={s.dept_id}>
                  <td>{idx + 1}</td>
                  <td style={{ fontWeight: 700 }}>{s.dept_name}</td>
                  <td>Shift {s.shift === 1 ? "I" : "II"}</td>
                  <td>
                    {s.vice_secretary ? (
                      <div>
                        <p style={{ fontWeight: 600 }}>{s.vice_secretary.name}</p>
                        <p style={{ fontSize: "12px", color: "var(--color-text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
                          <Phone size={12} /> {s.vice_secretary.phone}
                        </p>
                      </div>
                    ) : (
                      <span style={{ color: "var(--color-text-muted)", fontStyle: "italic", fontSize: "13px" }}>First login pending</span>
                    )}
                  </td>
                  <td>
                    {s.student_secretary ? (
                      <div>
                        <p style={{ fontWeight: 600 }}>{s.student_secretary.name}</p>
                        <p style={{ fontSize: "12px", color: "var(--color-text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
                          <Phone size={12} /> {s.student_secretary.phone}
                        </p>
                      </div>
                    ) : (
                      <span style={{ color: "var(--color-text-muted)", fontStyle: "italic", fontSize: "13px" }}>First login pending</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminDepartmentSecretary;
