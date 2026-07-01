import { useEffect, useMemo, useState } from "react";
import {
  FiCalendar,
  FiClock,
  FiFileText,
  FiMapPin,
  FiDollarSign,
  FiEdit2,
  FiPhone,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiTrash2,
  FiBriefcase,
  FiCheckCircle,
  FiUserCheck,
  FiUsers,
} from "react-icons/fi";
import "./Staff.css";
import {
  addStaff,
  deleteStaff,
  getStaff,
  getStaffSummary,
  updateStaff,
} from "../services/staffService";

const todayInput = () => new Date().toISOString().slice(0, 10);

const emptyStaff = {
  employee_id: "",
  name: "",
  mobile: "",
  email: "",
  department: "",
  role: "",
  salary: "",
  joining_date: todayInput(),
  status: "Active",
  address: "",
  note: "",
};

const formatMoney = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 10);
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const futureModules = ["Attendance", "Salary", "Advance", "Leaves", "Performance"];

function Staff() {
  const [staff, setStaff] = useState([]);
  const [summary, setSummary] = useState({
    total_staff: 0,
    active_staff: 0,
    inactive_staff: 0,
    monthly_salary: 0,
  });
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [form, setForm] = useState(emptyStaff);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState({});

  const loadStaff = async (preferredId) => {
    try {
      setLoading(true);
      setError("");
      const [summaryData, staffData] = await Promise.all([getStaffSummary(), getStaff()]);
      setSummary(summaryData);
      setStaff(staffData);

      const target = staffData.find((item) => String(item.id) === String(preferredId || selectedStaff?.id)) || staffData[0] || null;
      setSelectedStaff(target);
    } catch (err) {
      console.log(err);
      setError("Staff data load failed. Please check backend and database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadStaff();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredStaff = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return staff;

    return staff.filter((item) =>
      [item.name, item.mobile, item.role, item.status, item.address]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    );
  }, [staff, search]);

  const showSuccess = (text) => {
    setMessage(text);
    window.setTimeout(() => setMessage(""), 2600);
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({ ...emptyStaff, joining_date: todayInput() });
  };

  const openAddForm = () => {
    resetForm();
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const editStaff = (item) => {
    setEditingId(item.id);
    setForm({
  employee_id: item.employee_id || "",
  name: item.name || "",
  mobile: item.mobile || "",
  email: item.email || "",
  department: item.department || "",
  role: item.role || "",
  salary: item.salary || "",
  joining_date: item.joining_date
    ? String(item.joining_date).slice(0, 10)
    : todayInput(),
  status: item.status || "Active",
  address: item.address || "",
  note: item.note || "",
});
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
const validateForm = () => {

  if (!form.employee_id.trim()) {
    setError("Employee ID is required.");
    return false;
  }

  if (!form.name.trim()) {
    setError("Employee Name is required.");
    return false;
  }

  if (!/^[A-Za-z ]+$/.test(form.name)) {
    setError("Employee Name should contain only letters.");
    return false;
  }

  if (!/^[6-9]\d{9}$/.test(form.mobile)) {
    setError("Enter valid 10 digit mobile number.");
    return false;
  }

  if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) {
    setError("Enter valid email address.");
    return false;
  }

  if (!form.department) {
    setError("Please select department.");
    return false;
  }

  if (!form.role.trim()) {
    setError("Designation is required.");
    return false;
  }

  if (!form.salary || Number(form.salary) <= 0) {
    setError("Salary must be greater than 0.");
    return false;
  }

  if (!form.joining_date) {
    setError("Joining Date is required.");
    return false;
  }

  return true;
};
  const handleFormChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const submitStaff = async (event) => {
    event.preventDefault();
    setError("");

if (!validateForm()) {
  return;
}

    try {
      setSaving(true);
      setError("");

      if (editingId) {
        await updateStaff(editingId, form);
        showSuccess("Staff updated successfully.");
        await loadStaff(editingId);
      } else {
        const result = await addStaff(form);
        showSuccess("Staff added successfully.");
        await loadStaff(result.id);
      }

      resetForm();
      setShowForm(false);
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message || "Staff save failed.");
    } finally {
      setSaving(false);
    }
  };

  const removeStaff = async (item) => {
    if (!window.confirm(`Delete ${item.name}? Complete attendance, salary, advance history will also be removed.`)) return;

    try {
      setError("");
      await deleteStaff(item.id);
      showSuccess("Staff deleted successfully.");
      await loadStaff();
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message || "Staff delete failed.");
    }
  };

  return (
    <div className="staff-page">
      <div className="staff-header">
        <div>
          <span className="staff-kicker"><FiUserCheck /> Staff Management</span>
          <h1>Staff Management</h1>
          <p>Manage staff records, salary information, attendance, advances, and complete history.</p>
        </div>
        <button className="staff-primary-btn" type="button" onClick={openAddForm}>
          <FiPlus /> Add Staff
        </button>
      </div>

      {(message || error) && <div className={error ? "staff-alert error" : "staff-alert success"}>{error || message}</div>}

      <div className="staff-summary-grid">
        <div className="staff-summary-card">
          <FiUsers />
          <span>Total Staff</span>
          <strong>{summary.total_staff}</strong>
        </div>
        <div className="staff-summary-card active">
          <FiUserCheck />
          <span>Active Staff</span>
          <strong>{summary.active_staff}</strong>
        </div>
        <div className="staff-summary-card inactive">
          <FiClock />
          <span>Inactive Staff</span>
          <strong>{summary.inactive_staff}</strong>
        </div>
        <div className="staff-summary-card salary">
          <FiDollarSign />
          <span>Monthly Salary</span>
          <strong>{formatMoney(summary.monthly_salary)}</strong>
        </div>
      </div>

      {showForm && (
        <section className="staff-form-card">
          <div className="staff-section-title">
            <div>
              <h2>{editingId ? "Edit Staff" : "Add Staff"}</h2>
              <p>{editingId ? "Update selected staff information." : "Create a staff profile with salary and joining details."}</p>
            </div>
            <button type="button" onClick={() => { resetForm(); setShowForm(false); }}>
              Cancel
            </button>
          </div>

          <form onSubmit={submitStaff}>
            <div className="staff-form-grid">

<label>
Employee ID
<input
name="employee_id"
value={form.employee_id}
onChange={handleFormChange}
placeholder="EMP001"
/>
{validationErrors.employee_id && (
  <small className="error-text">
    {validationErrors.employee_id}
  </small>
)}
</label>

<label>
Employee Name
<input
name="name"
value={form.name}
onChange={handleFormChange}
required
/>
{validationErrors.name && (
  <small className="error-text">
    {validationErrors.name}
  </small>
)}
</label>

<label>
Mobile Number
<input
name="mobile"
value={form.mobile}
onChange={handleFormChange}
required
/>
{validationErrors.mobile && (
  <small className="error-text">
    {validationErrors.mobile}
  </small>
)}
</label>

<label>
Email Address
<input
type="email"
name="email"
value={form.email}
onChange={handleFormChange}
/>
{validationErrors.email && (
  <small className="error-text">
    {validationErrors.email}
  </small>
)}
</label>

<label>
Department
<select
name="department"
value={form.department}
onChange={handleFormChange}
>
  {validationErrors.department && (
  <small className="error-text">
    {validationErrors.department}
  </small>
)}

<option value="">Select</option>

<option>Sales</option>

<option>Accounts</option>

<option>Marketing</option>

<option>Store</option>

<option>Delivery</option>

<option>HR</option>

<option>Admin</option>

</select>
</label>

<label>
Designation
<input
name="role"
value={form.role}
onChange={handleFormChange}
required
/>
{validationErrors.role && (
  <small className="error-text">
    {validationErrors.role}
  </small>
)}
</label>

<label>
Monthly Salary
<input
type="number"
name="salary"
value={form.salary}
onChange={handleFormChange}
/>
{validationErrors.salary && (
  <small className="error-text">
    {validationErrors.salary}
  </small>
)}
</label>

<label>
Joining Date
<input
type="date"
name="joining_date"
value={form.joining_date}
onChange={handleFormChange}
/>
{validationErrors.joining_date && (
  <small className="error-text">
    {validationErrors.joining_date}
  </small>
)}
</label>

<label>
Status

<select
name="status"
value={form.status}
onChange={handleFormChange}
>

<option>Active</option>

<option>Inactive</option>

</select>

</label>

<label className="staff-field-wide">

Address

<textarea
rows="2"
name="address"
value={form.address}
onChange={handleFormChange}
/>

</label>

<label className="staff-field-wide">

Notes

<textarea
rows="2"
name="note"
value={form.note}
onChange={handleFormChange}
/>

</label>

</div>
            <button className="staff-save-btn" type="submit" disabled={saving}>
              {saving ? "Saving..." : editingId ? "Update Staff" : "Save Staff"}
            </button>
          </form>
        </section>
      )}

      <div className="staff-workspace">
        <aside className="staff-list-panel">
          <div className="staff-search-box">
            <FiSearch />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search Staff" />
          </div>
          <div className="staff-list-title">
            <h2>Staff List</h2>
            <button type="button" onClick={() => loadStaff(selectedStaff?.id)} aria-label="Refresh staff">
              <FiRefreshCw />
            </button>
          </div>

          <div className="staff-list">
            {loading ? (
              <div className="staff-empty">Loading staff...</div>
            ) : filteredStaff.length ? (
              filteredStaff.map((item) => (
                <button
                  className={selectedStaff?.id === item.id ? "staff-list-item active" : "staff-list-item"}
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedStaff(item)}
                >
                  <span className="staff-avatar">{item.name?.charAt(0)?.toUpperCase() || "S"}</span>
                  <span>
                    <strong>{item.name}</strong>
                    <small>{item.role} - {item.mobile}</small>
                  </span>
                  <b className={item.status === "Active" ? "active" : "inactive"}>{item.status}</b>
                </button>
              ))
            ) : (
              <div className="staff-empty">No staff found.</div>
            )}
          </div>
        </aside>

        <main className="staff-detail-panel">
          {selectedStaff ? (
            <>
              <section className="staff-profile-card">
                <div className="staff-profile-title">
                  <span className="staff-avatar large">{selectedStaff.name?.charAt(0)?.toUpperCase() || "S"}</span>
                  <div>
                    <p>Staff Profile</p>
                    <h2>{selectedStaff.name}</h2>
                  </div>
                </div>

                <div className="staff-profile-list">
                  <div className="staff-profile-row">
                    <FiUserCheck />
                    <span>Name</span>
                    <strong>{selectedStaff.name || "-"}</strong>
                  </div>
                  <div className="staff-profile-row">
                    <FiPhone />
                    <span>Mobile</span>
                    <strong>{selectedStaff.mobile || "-"}</strong>
                  </div>
                  <div className="staff-profile-row">
                    <FiBriefcase />
                    <span>Role</span>
                    <strong>{selectedStaff.role || "-"}</strong>
                  </div>
                  <div className="staff-profile-row">
                    <FiDollarSign />
                    <span>Salary</span>
                    <strong>{formatMoney(selectedStaff.salary)}</strong>
                  </div>
                  <div className="staff-profile-row">
                    <FiCalendar />
                    <span>Joining Date</span>
                    <strong>{formatDate(selectedStaff.joining_date)}</strong>
                  </div>
                  <div className="staff-profile-row">
                    <FiCheckCircle />
                    <span>Status</span>
                    <strong className={selectedStaff.status === "Active" ? "status-active" : "status-inactive"}>{selectedStaff.status || "-"}</strong>
                  </div>
                  <div className="staff-profile-row wide">
                    <FiMapPin />
                    <span>Address</span>
                    <strong>{selectedStaff.address || "Not available"}</strong>
                  </div>
                  <div className="staff-profile-row wide">
                    <FiFileText />
                    <span>Notes</span>
                    <strong>{selectedStaff.note || "No notes added."}</strong>
                  </div>
                </div>
              </section>

              <section className="staff-quick-actions">
                <h3>Quick Actions</h3>
                <div className="staff-detail-actions">
                  <button type="button" onClick={() => editStaff(selectedStaff)}><FiEdit2 /> Edit Staff</button>
                  <button className="danger" type="button" onClick={() => removeStaff(selectedStaff)}><FiTrash2 /> Delete Staff</button>
                </div>
              </section>

              <section className="staff-future-card">
                <h3>Future Modules</h3>
                <div className="staff-future-list">
                  {futureModules.map((module) => (
                    <span key={module}>
                      <FiClock />
                      {module}
                    </span>
                  ))}
                </div>
              </section>
            </>
          ) : (
            <div className="staff-empty detail-empty">Select staff to view details.</div>
          )}
        </main>
      </div>
    </div>
  );
}

export default Staff;
