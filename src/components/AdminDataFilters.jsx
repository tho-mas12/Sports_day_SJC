import React, { useState, useEffect } from "react";
import { Filter, FileSpreadsheet, FileText, ChevronRight, X, CheckSquare, Square, RefreshCw } from "lucide-react";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

function AdminDataFilters() {
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);
  const [totalUniqueCount, setTotalUniqueCount] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");

  // Metadata for filter options
  const [filterMetadata, setFilterMetadata] = useState({
    departments: [],
    events: [],
    years: []
  });

  // Selected filter states
  const [selectedShifts, setSelectedShifts] = useState([1, 2]);
  const [selectedGenders, setSelectedGenders] = useState(["male", "female"]);
  const [selectedYears, setSelectedYears] = useState([]);
  const [selectedDepts, setSelectedDepts] = useState([]);
  const [selectedEvents, setSelectedEvents] = useState([]);

  // Fetch initial filters metadata and load all records
  const loadFilterMetadata = async () => {
    try {
      setLoading(true);
      const deptRes = await fetch("http://localhost:8000/api/admin/departments");
      const deptData = await deptRes.json();
      
      const evRes = await fetch("http://localhost:8000/api/admin/events");
      const evData = await evRes.json();

      const activeYearRes = await fetch("http://localhost:8000/api/admin/active-year");
      const activeYearData = await activeYearRes.json();
      const currentActiveYear = activeYearData.active_year || new Date().getFullYear().toString();

      // Trigger a default filter query to fetch years and initial records for active year
      const initFilterRes = await fetch("http://localhost:8000/api/reports/filter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ years: [currentActiveYear] })
      });
      const initFilterData = await initFilterRes.json();

      if (deptRes.ok && evRes.ok && initFilterRes.ok) {
        // Ensure the active year is included in the available years dropdown metadata list
        const yearsList = initFilterData.available_years.includes(currentActiveYear)
          ? initFilterData.available_years
          : [...initFilterData.available_years, currentActiveYear].sort();

        setFilterMetadata({
          departments: deptData,
          events: evData,
          years: yearsList
        });

        // Initialize selections to all departments/events, but filter to current active year by default
        setSelectedDepts(deptData.map(d => d._id));
        setSelectedEvents(evData.map(e => e._id));
        setSelectedYears([currentActiveYear]);
        
        setRecords(initFilterData.records);
        setTotalUniqueCount(initFilterData.total_unique_count);
      } else {
        setErrorMsg("Failed to load filter metadata.");
      }
    } catch (err) {
      setErrorMsg("Failed to connect to backend server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFilterMetadata();
  }, []);

  const handleApplyFilters = async () => {
    setErrorMsg("");
    setLoading(true);
    
    const payload = {
      shifts: selectedShifts,
      departments: selectedDepts,
      genders: selectedGenders,
      events: selectedEvents,
      years: selectedYears
    };

    try {
      const res = await fetch("http://localhost:8000/api/reports/filter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        setRecords(data.records);
        setTotalUniqueCount(data.total_unique_count);
        setShowFilters(false); // Close sidebar
      } else {
        setErrorMsg(data.detail || "Failed to query records.");
      }
    } catch (err) {
      setErrorMsg("Failed to fetch reports.");
    } finally {
      setLoading(false);
    }
  };

  // Helper toggle functions
  const toggleSelectAll = (list, setFn, allItems) => {
    if (list.length === allItems.length) {
      setFn([]); // Uncheck all
    } else {
      setFn(allItems); // Check all
    }
  };

  const handleItemCheck = (list, setFn, item) => {
    if (list.includes(item)) {
      setFn(list.filter(x => x !== item));
    } else {
      setFn([...list, item]);
    }
  };

  // Excel Export Handler
  const handleExportExcel = () => {
    if (records.length === 0) return;
    const dataToExport = records.map((r, index) => ({
      "S.No": index + 1,
      "Department no": r.student_id,
      "participation name": r.student_name,
      "Department": r.dept_name,
      "Shift": r.shift === 1 ? "Shift I" : "Shift II",
      "Gender": r.gender.toUpperCase(),
      "Event Name": r.event_name,
      "Event Type": r.event_type.toUpperCase(),
      "Role": r.role,
      "Year": r.year,
      "Date": r.date
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Participants");
    XLSX.writeFile(wb, `SJC_Sports_Day_Registrations_${new Date().getFullYear()}.xlsx`);
  };

  // PDF Export Handler
  const handleExportPDF = () => {
    if (records.length === 0) return;
    const doc = new jsPDF("l", "mm", "a4"); // Landscape A4 is best for wide lists
    
    // Add banner/header
    doc.setFillColor(30, 64, 175); // Royal Blue banner
    doc.rect(0, 0, 297, 30, "F");
    
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("ST. JOSEPH'S COLLEGE (AUTONOMOUS)", 14, 14);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text("SJC Sports Day Participant Registrations Report", 14, 22);

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(10);
    doc.text(`Total Records: ${records.length} | Unique Participation: ${totalUniqueCount}`, 14, 40);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 230, 40);

    const headers = [["S.No", "Department no", "participation name", "Department", "Shift", "Gender", "Event Name", "Role", "Date"]];
    const data = records.map((r, idx) => [
      idx + 1,
      r.student_id,
      r.student_name,
      r.dept_name,
      r.shift === 1 ? "Shift I" : "Shift II",
      r.gender.toUpperCase(),
      r.event_name,
      r.role,
      r.date
    ]);

    autoTable(doc, {
      head: headers,
      body: data,
      startY: 46,
      theme: "striped",
      styles: { fontSize: 8, font: "helvetica" },
      headStyles: { fillColor: [30, 64, 175] }
    });

    doc.save(`SJC_Sports_Day_Registrations_${new Date().getFullYear()}.pdf`);
  };

  // Attendance Sheet PDF Exporter
  const handleExportAttendancePDF = () => {
    if (records.length === 0) return;
    const doc = new jsPDF("l", "mm", "a4");
    
    // Deep Violet theme for Attendance Sheet
    doc.setFillColor(109, 40, 217); 
    doc.rect(0, 0, 297, 30, "F");
    
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("ST. JOSEPH'S COLLEGE (AUTONOMOUS)", 14, 14);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text("SJC Sports Day Participant Attendance Sheet", 14, 22);

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(10);
    doc.text(`Total Records: ${records.length} | Unique Participation: ${totalUniqueCount}`, 14, 40);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 230, 40);

    const headers = [["S.No", "Name", "Department no", "Department", "Event name", "Shift", "Present", "Absent"]];
    const data = records.map((r, idx) => [
      idx + 1,
      r.student_name,
      r.student_id,
      r.dept_name,
      r.event_name,
      r.shift === 1 ? "Shift I" : "Shift II",
      "", // Present space
      ""  // Absent space
    ]);

    autoTable(doc, {
      head: headers,
      body: data,
      startY: 46,
      theme: "grid", // Grid theme is row and column wise
      styles: { fontSize: 9, font: "helvetica", cellPadding: 5, valign: "middle" },
      headStyles: { fillColor: [109, 40, 217], textColor: [255, 255, 255], fontStyle: "bold" },
      columnStyles: {
        6: { cellWidth: 22 }, // Present cell size
        7: { cellWidth: 22 }  // Absent cell size
      }
    });

    doc.save(`SJC_Sports_Day_Attendance_${new Date().getFullYear()}.pdf`);
  };

  if (loading && records.length === 0) {
    return <div style={{ padding: "40px", textAlign: "center", color: "var(--color-text-muted)" }}>Querying Database...</div>;
  }

  return (
    <div className="animate-fade-in" style={{ position: "relative" }}>
      {/* Header Banner */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <div>
          <h1 style={{ fontSize: "28px", color: "var(--color-primary)", marginBottom: "4px" }}>
            Data Filters & Reports
          </h1>
          <p style={{ color: "var(--color-text-muted)", fontSize: "14px" }}>
            Extract registration analytics, filter datasets, and download PDF/Excel reports
          </p>
        </div>
        
        <div style={{ display: "flex", gap: "12px" }}>
          <button className="btn-primary" onClick={() => setShowFilters(true)}>
            <Filter size={16} />
            Use Me (Filter Panel)
          </button>
        </div>
      </div>

      {errorMsg && (
        <div style={{ padding: "14px", backgroundColor: "#fef2f2", color: "var(--color-danger)", border: "1px solid #fee2e2", borderRadius: "var(--radius-md)", fontSize: "14px", marginBottom: "24px", fontWeight: 600 }}>
          {errorMsg}
        </div>
      )}

      {/* Metrics Row */}
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        backgroundColor: "white", 
        padding: "20px 24px", 
        borderRadius: "var(--radius-md)", 
        border: "1px solid var(--color-border)",
        marginBottom: "28px"
      }}>
        <div>
          <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>Total Registered participants ( Unique )</span>
          <h2 style={{ fontSize: "28px", color: "var(--color-primary)", fontFamily: "var(--font-display)", fontWeight: 800 }}>
            {totalUniqueCount} <span style={{ fontSize: "14px", color: "var(--color-text-muted)", fontWeight: 500 }}>participation</span>
          </h2>
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          <button 
            className="btn-secondary" 
            onClick={handleExportExcel}
            disabled={records.length === 0}
            style={{ color: "#166534", border: "1px solid #bbf7d0", backgroundColor: "#f0fdf4" }}
          >
            <FileSpreadsheet size={16} /> Export Excel
          </button>
          <button 
            className="btn-secondary" 
            onClick={handleExportPDF}
            disabled={records.length === 0}
            style={{ color: "#991b1b", border: "1px solid #fecaca", backgroundColor: "#fef2f2" }}
          >
            <FileText size={16} /> Export PDF
          </button>
          <button 
            className="btn-secondary" 
            onClick={handleExportAttendancePDF}
            disabled={records.length === 0}
            style={{ color: "#6d28d9", border: "1px solid #ddd6fe", backgroundColor: "#f5f3ff" }}
          >
            <FileText size={16} /> Attendance PDF
          </button>
        </div>
      </div>

      {/* Table of Records */}
      <div className="table-container animate-fade-in">
        <table className="custom-table">
          <thead>
            <tr>
              <th>S.No</th>
              <th>Department no</th>
              <th>participation name</th>
              <th>Department</th>
              <th>Shift</th>
              <th>Gender</th>
              <th>Event Name</th>
              <th>Role</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {records.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: "center", padding: "40px", color: "var(--color-text-muted)" }}>
                  No participant records found matching the active filters.
                </td>
              </tr>
            ) : (
              records.map((r, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td style={{ fontWeight: 700, fontFamily: "monospace" }}>{r.student_id}</td>
                  <td>{r.student_name}</td>
                  <td>{r.dept_name}</td>
                  <td>Shift {r.shift === 1 ? "I" : "II"}</td>
                  <td style={{ textTransform: "capitalize" }}>{r.gender}</td>
                  <td>{r.event_name}</td>
                  <td>
                    <span className={`event-card-badge ${r.role === "Soloist" ? "badge-solo" : "badge-team"}`}>
                      {r.role}
                    </span>
                  </td>
                  <td>{r.date}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Side Filter Panel Drawer */}
      {showFilters && (
        <>
          <div className="modal-overlay" style={{ backdropFilter: "none" }} onClick={() => setShowFilters(false)}></div>
          <div className="filters-panel">
            <div className="filters-header">
              <h3 style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--color-primary)" }}>
                <Filter size={18} />
                Filters Config
              </h3>
              <button onClick={() => setShowFilters(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-muted)" }}>
                <X size={20} />
              </button>
            </div>
            
            <div className="filters-body">
              {/* Filter 1: Date & Year */}
              <div style={{ marginBottom: "28px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <h4 className="form-label" style={{ fontSize: "11px" }}>Years</h4>
                  <button 
                    style={{ fontSize: "11px", color: "var(--color-primary-light)", background: "none", border: "none", cursor: "pointer" }}
                    onClick={() => toggleSelectAll(selectedYears, setSelectedYears, filterMetadata.years)}
                  >
                    Select All
                  </button>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {filterMetadata.years.map(y => (
                    <label key={y} style={{ display: "flex", alignItems: "center", gap: "6px", backgroundColor: "#f8fafc", padding: "6px 12px", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)", cursor: "pointer", fontSize: "12px" }}>
                      <input 
                        type="checkbox"
                        checked={selectedYears.includes(y)}
                        onChange={() => handleItemCheck(selectedYears, setSelectedYears, y)}
                      />
                      <span>{y}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Filter 2: Shift */}
              <div style={{ marginBottom: "28px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <h4 className="form-label" style={{ fontSize: "11px" }}>Shifts</h4>
                  <button 
                    style={{ fontSize: "11px", color: "var(--color-primary-light)", background: "none", border: "none", cursor: "pointer" }}
                    onClick={() => toggleSelectAll(selectedShifts, setSelectedShifts, [1, 2])}
                  >
                    Select All
                  </button>
                </div>
                <div style={{ display: "flex", gap: "12px" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", cursor: "pointer" }}>
                    <input type="checkbox" checked={selectedShifts.includes(1)} onChange={() => handleItemCheck(selectedShifts, setSelectedShifts, 1)} />
                    <span>Shift I</span>
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", cursor: "pointer" }}>
                    <input type="checkbox" checked={selectedShifts.includes(2)} onChange={() => handleItemCheck(selectedShifts, setSelectedShifts, 2)} />
                    <span>Shift II</span>
                  </label>
                </div>
              </div>

              {/* Filter 3: Gender */}
              <div style={{ marginBottom: "28px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <h4 className="form-label" style={{ fontSize: "11px" }}>Genders</h4>
                  <button 
                    style={{ fontSize: "11px", color: "var(--color-primary-light)", background: "none", border: "none", cursor: "pointer" }}
                    onClick={() => toggleSelectAll(selectedGenders, setSelectedGenders, ["male", "female"])}
                  >
                    Select All
                  </button>
                </div>
                <div style={{ display: "flex", gap: "12px" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", cursor: "pointer" }}>
                    <input type="checkbox" checked={selectedGenders.includes("male")} onChange={() => handleItemCheck(selectedGenders, setSelectedGenders, "male")} />
                    <span>Male</span>
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", cursor: "pointer" }}>
                    <input type="checkbox" checked={selectedGenders.includes("female")} onChange={() => handleItemCheck(selectedGenders, setSelectedGenders, "female")} />
                    <span>Female</span>
                  </label>
                </div>
              </div>

              {/* Filter 4: Department */}
              <div style={{ marginBottom: "28px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <h4 className="form-label" style={{ fontSize: "11px" }}>Departments</h4>
                  <button 
                    style={{ fontSize: "11px", color: "var(--color-primary-light)", background: "none", border: "none", cursor: "pointer" }}
                    onClick={() => toggleSelectAll(selectedDepts, setSelectedDepts, filterMetadata.departments.map(d => d._id))}
                  >
                    Select All
                  </button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "200px", overflowY: "auto", border: "1px solid var(--color-border)", padding: "10px", borderRadius: "var(--radius-sm)" }}>
                  {filterMetadata.departments.map(d => (
                    <label key={d._id} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", cursor: "pointer" }}>
                      <input 
                        type="checkbox" 
                        checked={selectedDepts.includes(d._id)} 
                        onChange={() => handleItemCheck(selectedDepts, setSelectedDepts, d._id)} 
                      />
                      <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{d.name} (S{d.shift})</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Filter 5: Events */}
              <div style={{ marginBottom: "28px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <h4 className="form-label" style={{ fontSize: "11px" }}>Events</h4>
                  <button 
                    style={{ fontSize: "11px", color: "var(--color-primary-light)", background: "none", border: "none", cursor: "pointer" }}
                    onClick={() => toggleSelectAll(selectedEvents, setSelectedEvents, filterMetadata.events.map(e => e._id))}
                  >
                    Select All
                  </button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "200px", overflowY: "auto", border: "1px solid var(--color-border)", padding: "10px", borderRadius: "var(--radius-sm)" }}>
                  {filterMetadata.events.map(e => (
                    <label key={e._id} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", cursor: "pointer" }}>
                      <input 
                        type="checkbox" 
                        checked={selectedEvents.includes(e._id)} 
                        onChange={() => handleItemCheck(selectedEvents, setSelectedEvents, e._id)} 
                      />
                      <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{e.name} ({e.gender})</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="filters-footer">
              <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowFilters(false)}>Cancel</button>
              <button className="btn-primary" style={{ flex: 1.5 }} onClick={handleApplyFilters}>Apply Filters</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default AdminDataFilters;
