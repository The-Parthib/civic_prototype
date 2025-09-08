import React, { useEffect, useState, useMemo } from "react";
import { ChevronDown, ChevronRight, Users, MapPin, Settings, UserCheck } from "lucide-react";

const port = import.meta.env.VITE_DB_PORT;

const Department = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [complaints, setComplaints] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    responsibilities: [""],
    department_head_uid: "",
    staffs: [{ id: "", responsibility: "" }],
  });
  const [deptComplaints, setDeptComplaints] = useState({}); // { deptId: [complaints] }
  const [openDept, setOpenDept] = useState(null);
  const [complaintLoading, setComplaintLoading] = useState(false);
  const [assigning, setAssigning] = useState(null); // complaint id being assigned
  const [selectedStaff, setSelectedStaff] = useState("");
  const [assignError, setAssignError] = useState("");
  const [assignSubmitting, setAssignSubmitting] = useState(false);
  
  // New state for auto-allocation features
  const [allStaff, setAllStaff] = useState([]);
  const [allComplaints, setAllComplaints] = useState([]);
  const [showManagement, setShowManagement] = useState(false);
  const [autoAllocating, setAutoAllocating] = useState(false);

  useEffect(() => {
    let admin = sessionStorage.getItem("adminName");
    // console.log(JSON.parse(admin));
    const adminData = JSON.parse(admin);
    if (admin == null) {
    } else {
      // Fetch complaints for this admin's district and pincode
      fetch(
        `http://localhost:${port}/complaints?location.district=${encodeURIComponent(
          adminData.district
        )}&location.pincode=${encodeURIComponent(adminData.pincode)}`
      )
        .then((res) => res.json())
        .then((data) => setComplaints(data))
        .catch((err) => {
          console.error("Error fetching complaints:", err);
          setComplaints([]);
        });
    }
    // console.log("comss:",complaints)
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const createdRes = await fetch(
        `http://localhost:${port}/createDepartment`
      );
      const created = createdRes.ok ? await createdRes.json() : [];
      // Normalize missing fields and support legacy 'responsibility' -> 'responsibilities'
      const normalized = created.map((d) => ({
        id: d.id,
        name: d.name,
        responsibilities: Array.isArray(d.responsibilities)
          ? d.responsibilities
          : d.responsibility
          ? [d.responsibility]
          : [],
        department_head_uid: d.department_head_uid || "",
        staffs: Array.isArray(d.staffs) ? d.staffs : [],
        createdAt: d.createdAt,
      }));
      setDepartments(normalized);
    } catch (e) {
      console.error(e);
      setError("Failed to load departments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchAllStaff();
    fetchAllComplaints();
  }, []);

  // Fetch all staff for auto-allocation
  const fetchAllStaff = async () => {
    try {
      const response = await fetch(`http://localhost:${port}/staffs`);
      if (response.ok) {
        const staff = await response.json();
        setAllStaff(staff);
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
    }
  };

  // Fetch all complaints for auto-allocation
  const fetchAllComplaints = async () => {
    try {
      const response = await fetch(`http://localhost:${port}/complaints`);
      if (response.ok) {
        const complaints = await response.json();
        setAllComplaints(complaints);
      }
    } catch (error) {
      console.error('Error fetching complaints:', error);
    }
  };

  // Auto-allocation algorithm
  const getWorkloadForStaff = (staffId) => {
    return allComplaints.filter(complaint => 
      complaint.assignedTo === staffId && 
      complaint.status !== "Rejected"
    ).length;
  };

  const autoAllocateStaff = async () => {
    setAutoAllocating(true);
    try {
      // Get unassigned complaints
      const unassignedComplaints = allComplaints.filter(complaint => 
        !complaint.assignedTo && complaint.status === "Submitted"
      );

      for (const complaint of unassignedComplaints) {
        // Find staff members for this complaint's department
        const availableStaff = allStaff.filter(staff => 
          staff.departmentName === complaint.department
        );

        if (availableStaff.length > 0) {
          // Find staff member with least workload
          const staffWithWorkload = availableStaff.map(staff => ({
            ...staff,
            currentWorkload: getWorkloadForStaff(staff.id)
          }));

          const selectedStaff = staffWithWorkload.reduce((min, current) => 
            current.currentWorkload < min.currentWorkload ? current : min
          );

          // Assign the complaint
          await fetch(`http://localhost:${port}/complaints/${complaint.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              assignedTo: selectedStaff.id,
              status: 'In Progress',
              updatedAt: new Date().toISOString()
            })
          });
        }
      }

      // Refresh data
      await fetchAllComplaints();
      
      // Refresh department complaints if any department is open
      if (openDept) {
        const openDepartment = departments.find(d => d.id === openDept);
        if (openDepartment) {
          await fetchDeptComplaints(openDepartment);
        }
      }

    } catch (error) {
      console.error('Auto-allocation failed:', error);
    } finally {
      setAutoAllocating(false);
    }
  };

  // Calculate unassigned complaints per department
  const unassignedByDepartment = useMemo(() => {
    const result = {};
    departments.forEach(dept => {
      result[dept.name] = allComplaints.filter(complaint => 
        complaint.department === dept.name && 
        !complaint.assignedTo && 
        complaint.status === "Submitted"
      ).length;
    });
    return result;
  }, [allComplaints, departments]);

  const updateField = (field, value) =>
    setForm((f) => ({ ...f, [field]: value }));

  // helpers to manage responsibilities array
  const updateResponsibility = (idx, value) =>
    setForm((f) => {
      const next = [...f.responsibilities];
      next[idx] = value;
      return { ...f, responsibilities: next };
    });

  const addResponsibility = () =>
    setForm((f) => ({ ...f, responsibilities: [...f.responsibilities, ""] }));

  const removeResponsibility = (idx) =>
    setForm((f) => ({
      ...f,
      responsibilities: f.responsibilities.filter((_, i) => i !== idx),
    }));

  const updateStaff = (idx, field, value) => {
    setForm((f) => {
      const next = [...f.staffs];
      next[idx] = { ...next[idx], [field]: value };
      return { ...f, staffs: next };
    });
  };

  const addStaffRow = () =>
    setForm((f) => ({
      ...f,
      staffs: [...f.staffs, { id: "", responsibility: "" }],
    }));

  const removeStaffRow = (idx) =>
    setForm((f) => ({
      ...f,
      staffs: f.staffs.filter((_, i) => i !== idx),
    }));

  const resetForm = () =>
    setForm({
      name: "",
      responsibilities: [""],
      department_head_uid: "",
      staffs: [{ id: "", responsibility: "" }],
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    // changed: validate at least one non-empty responsibility
    const cleanedResponsibilities = form.responsibilities
      .map((r) => r.trim())
      .filter(Boolean);
    if (!form.name.trim() || cleanedResponsibilities.length === 0) {
      setError("Name and at least one responsibility are required.");
      return;
    }
    setSubmitting(true);
    const payload = {
      id: Date.now().toString(),
      name: form.name.trim(),
      municipality: complaints.municipality,
      // changed: send 'responsibilities' array instead of single 'responsibility'
      responsibilities: cleanedResponsibilities,
      department_head_uid: form.department_head_uid.trim(),
      staffs: form.staffs
        .filter((s) => s.id.trim() || s.responsibility.trim())
        .map((s) => ({
          id: s.id.trim(),
          responsibility: s.responsibility.trim(),
        })),
      createdAt: new Date().toISOString(),
    };
    try {
      const res = await fetch(`http://localhost:${port}/createDepartment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to create department");
      setDepartments((prev) => [payload, ...prev]);
      resetForm();
      setShowForm(false);
    } catch (e) {
      console.error(e);
      setError("Failed to create department.");
    } finally {
      setSubmitting(false);
    }
  };

  const fetchDeptComplaints = async (dept) => {
    setComplaintLoading(true);
    try {
      const res = await fetch(
        `http://localhost:${port}/complaints?department=${encodeURIComponent(
          dept.name
        )}`
      );
      const data = res.ok ? await res.json() : [];
      setDeptComplaints((prev) => ({ ...prev, [dept.id]: data }));
    } catch (e) {
      console.error("Failed to fetch complaints for department", dept.name, e);
      setDeptComplaints((prev) => ({ ...prev, [dept.id]: [] }));
    } finally {
      setComplaintLoading(false);
    }
  };

  const toggleDept = (dept) => {
    if (openDept === dept.id) {
      setOpenDept(null);
      return;
    }
    setOpenDept(dept.id);
    if (!deptComplaints[dept.id]) {
      fetchDeptComplaints(dept);
    }
  };

  const submitAssignment = async (deptId, complaint) => {
    if (!selectedStaff.trim()) {
      setAssignError("Please choose a staff member.");
      return;
    }
    setAssignError("");
    setAssignSubmitting(true);
    try {
      const res = await fetch(
        `http://localhost:${port}/complaints/${complaint.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            assignedTo: selectedStaff,
            status: "In Progress",
            updatedAt: new Date().toISOString(),
          }),
        }
      );
      if (!res.ok) throw new Error("Failed to assign complaint");
      setDeptComplaints((prev) => ({
        ...prev,
        [deptId]: prev[deptId].map((c) =>
          c.id === complaint.id
            ? { ...c, assignedTo: selectedStaff, status: "In Progress" }
            : c
        ),
      }));
      
      // Refresh all complaints data for auto-allocation
      await fetchAllComplaints();
      
      setAssigning(null);
      setSelectedStaff("");
    } catch (e) {
      console.error(e);
      setAssignError("Assignment failed. Try again.");
    } finally {
      setAssignSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-gray-600">
          Manage government departments and their administrators.
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setShowManagement(!showManagement)}
            className="bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded-md transition flex items-center gap-2"
          >
            <Settings size={16} />
            {showManagement ? "Hide Management" : "Show Management"}
          </button>
          <button
            onClick={() => {
              setError("");
              setShowForm((s) => !s);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-md transition"
          >
            {showForm ? "Close" : "Add Department"}
          </button>
        </div>
      </div>

      {showManagement && (
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center gap-2">
            <UserCheck size={20} />
            Staff Management Panel
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Auto-allocation section */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-700">Auto-allocation</h4>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-3">
                  Automatically assign unassigned complaints to staff members based on department and workload balance.
                </p>
                <button
                  onClick={autoAllocateStaff}
                  disabled={autoAllocating}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {autoAllocating ? "Allocating..." : "Auto-allocate Staff"}
                </button>
              </div>
            </div>

            {/* Unassigned complaints summary */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-700">Unassigned Complaints</h4>
              <div className="bg-orange-50 p-4 rounded-lg">
                {departments.length > 0 ? (
                  <div className="space-y-2">
                    {departments.map(dept => {
                      const unassignedCount = unassignedByDepartment[dept.name] || 0;
                      return (
                        <div key={dept.id} className="flex justify-between items-center text-sm">
                          <span className="text-gray-700">{dept.name}</span>
                          <span className={`font-medium ${unassignedCount > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                            {unassignedCount} unassigned
                          </span>
                        </div>
                      );
                    })}
                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between items-center text-sm font-medium">
                        <span>Total Unassigned:</span>
                        <span className="text-orange-600">
                          {Object.values(unassignedByDepartment).reduce((sum, count) => sum + count, 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No departments available</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-gray-200 rounded-lg p-5 space-y-5 shadow-sm"
        >
          <h3 className="text-lg font-semibold text-blue-800">
            Create Department
          </h3>
          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded">
              {error}
            </div>
          )}
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Name *
              </label>
              <input
                className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-blue-200"
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                required
              />
            </div>

            {/* changed: responsibilities as multiple inputs */}
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Responsibilities *
              </label>
              <div className="space-y-2">
                {form.responsibilities.map((r, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      className="flex-1 border rounded px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-blue-200"
                      placeholder={`Responsibility ${idx + 1}`}
                      value={r}
                      onChange={(e) =>
                        updateResponsibility(idx, e.target.value)
                      }
                    />
                    {form.responsibilities.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeResponsibility(idx)}
                        className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
                        title="Remove"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addResponsibility}
                  className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded"
                >
                  Add Responsibility
                </button>
              </div>
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Department Head User ID
              </label>
              <input
                className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-blue-200"
                value={form.department_head_uid}
                onChange={(e) =>
                  updateField("department_head_uid", e.target.value)
                }
                placeholder="Optional"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-gray-700">
                Staff Members
              </h4>
              <button
                type="button"
                onClick={addStaffRow}
                className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
              >
                + Add Staff
              </button>
            </div>
            <div className="space-y-2">
              {form.staffs.map((s, idx) => (
                <div
                  key={idx}
                  className="grid md:grid-cols-5 gap-2 items-center bg-gray-50 p-2 rounded"
                >
                  <input
                    className="md:col-span-2 border rounded px-2 py-1 text-sm focus:outline-none focus:ring focus:ring-blue-200"
                    placeholder="Staff User ID"
                    value={s.id}
                    onChange={(e) => updateStaff(idx, "id", e.target.value)}
                  />
                  <input
                    className="md:col-span-3 border rounded px-2 py-1 text-sm focus:outline-none focus:ring focus:ring-blue-200"
                    placeholder="Responsibility"
                    value={s.responsibility}
                    onChange={(e) =>
                      updateStaff(idx, "responsibility", e.target.value)
                    }
                  />
                  {form.staffs.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeStaffRow(idx)}
                      className="text-xs text-red-600 hover:underline md:col-span-5 text-left"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm px-5 py-2 rounded-md"
            >
              {submitting ? "Saving..." : "Create Department"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Reset
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-blue-800">
          Departments ({departments.length})
        </h3>
        {loading && (
          <p className="text-sm text-gray-500">Loading departments...</p>
        )}
        {!loading && departments.length === 0 && (
          <p className="text-sm text-gray-500">
            No departments yet. Click &quot;Add Department&quot; to create one.
          </p>
        )}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {departments.map((d) => {
            const loadedComplaints = deptComplaints[d.id] || [];
            const complaintCount =
              openDept === d.id || deptComplaints[d.id]
                ? loadedComplaints.length
                : null;
            const unassignedCount = unassignedByDepartment[d.name] || 0;
            return (
              <div
                key={d.id}
                onClick={() => toggleDept(d)}
                className={`relative group border border-gray-200 bg-white rounded-xl shadow-sm transition cursor-pointer p-4 ${
                  openDept === d.id
                    ? "ring-2 ring-blue-400 shadow-md"
                    : "hover:shadow-md"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm pr-6">
                      {d.name || "Unnamed"}
                      {unassignedCount > 0 && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          {unassignedCount} unassigned
                        </span>
                      )}
                    </h4>
                    {/* changed: display multiple responsibilities */}
                    <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2">
                      {d.responsibilities && d.responsibilities.length
                        ? d.responsibilities.join(", ")
                        : "No responsibilities set."}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] text-gray-400">
                      {d.createdAt
                        ? new Date(d.createdAt).toLocaleDateString()
                        : ""}
                    </span>
                    <span className="text-[10px] bg-blue-100 text-blue-700 font-medium px-2 py-0.5 rounded-full">
                      {complaintCount === null
                        ? "—"
                        : `${complaintCount} issue${
                            complaintCount === 1 ? "" : "s"
                          }`}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-y-1 text-[11px] mt-1">
                  <div className="text-gray-500">
                    Head:{" "}
                    <span className="font-medium text-gray-700 truncate">
                      {d.department_head_uid || "—"}
                    </span>
                  </div>
                  <div className="text-gray-500 text-right">
                    Staff:{" "}
                    <span className="font-medium">{d.staffs.length}</span>
                  </div>
                </div>

                {d.staffs.length > 0 && (
                  <details
                    className="mt-3 bg-gray-50 rounded p-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <summary className="cursor-pointer text-[11px] text-blue-700 font-medium">
                      Staff Members
                    </summary>
                    <ul className="mt-2 space-y-1 max-h-28 overflow-auto pr-1">
                      {d.staffs.map((s, i) => (
                        <li
                          key={i}
                          className="flex justify-between bg-white border border-gray-200 rounded px-2 py-1 text-[11px]"
                        >
                          <span className="truncate">{s.id || "(no id)"}</span>
                          <span className="text-gray-600 truncate ml-2">
                            {s.responsibility || "—"}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </details>
                )}

                {/* Complaints section */}
                <div
                  className="mt-4 border-t pt-3"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-gray-700">
                      Complaints
                    </span>
                    <span className="text-[10px] text-blue-600">
                      {openDept === d.id ? "Collapse" : "Expand"}
                    </span>
                  </div>

                  {openDept === d.id && (
                    <div className="mt-2">
                      {complaintLoading && !deptComplaints[d.id] && (
                        <p className="text-[11px] text-gray-500">
                          Loading complaints...
                        </p>
                      )}
                      {deptComplaints[d.id] &&
                        deptComplaints[d.id].length === 0 &&
                        !complaintLoading && (
                          <p className="text-[11px] text-gray-500">
                            No complaints for this department.
                          </p>
                        )}
                      {deptComplaints[d.id] &&
                        deptComplaints[d.id].length > 0 && (
                          <ul className="space-y-2 max-h-64 overflow-auto pr-1">
                            {deptComplaints[d.id].map((c) => (
                              <li
                                key={c.id}
                                className="bg-gray-50 border border-gray-200 rounded p-2 text-[11px] space-y-1 hover:bg-gray-100 transition"
                              >
                                <div className="flex justify-between gap-2">
                                  <span
                                    className="font-medium truncate"
                                    title={c.title}
                                  >
                                    {c.title}
                                  </span>
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                      c.status === "Resolved"
                                        ? "bg-green-100 text-green-700"
                                        : c.status === "In Progress"
                                        ? "bg-blue-100 text-blue-700"
                                        : "bg-orange-100 text-orange-700"
                                    }`}
                                  >
                                    {c.status}
                                  </span>
                                </div>
                                <div className="flex justify-between gap-2">
                                  <span className="text-gray-500 truncate">
                                    {c.assignedTo
                                      ? `Assigned: ${c.assignedTo}`
                                      : "Unassigned"}
                                  </span>
                                  <span className="text-gray-400">
                                    {c.createdAt
                                      ? new Date(
                                          c.createdAt
                                        ).toLocaleDateString()
                                      : ""}
                                  </span>
                                </div>

                                {assigning === c.id ? (
                                  <div className="mt-2 bg-white border border-blue-200 rounded p-2 space-y-2">
                                    <div>
                                      <select
                                        className="w-full border rounded px-2 py-1 focus:outline-none focus:ring focus:ring-blue-200"
                                        value={selectedStaff}
                                        onChange={(e) =>
                                          setSelectedStaff(e.target.value)
                                        }
                                      >
                                        <option value="">Select staff</option>
                                        {d.staffs.map((s, i) => (
                                          <option key={i} value={s.id}>
                                            {s.id}
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                    {assignError && (
                                      <p className="text-[10px] text-red-600">
                                        {assignError}
                                      </p>
                                    )}
                                    <div className="flex gap-2">
                                      <button
                                        className="flex-1 bg-blue-600 text-white rounded px-2 py-1 hover:bg-blue-700 text-[11px] disabled:opacity-60"
                                        disabled={assignSubmitting}
                                        onClick={() =>
                                          submitAssignment(d.id, c)
                                        }
                                      >
                                        {assignSubmitting
                                          ? "Assigning..."
                                          : "Confirm"}
                                      </button>
                                      <button
                                        className="flex-1 bg-gray-200 text-gray-700 rounded px-2 py-1 hover:bg-gray-300 text-[11px]"
                                        onClick={() => {
                                          setAssigning(null);
                                          setSelectedStaff("");
                                          setAssignError("");
                                        }}
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex justify-end">
                                    <button
                                      className="text-[10px] bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                                      onClick={() => {
                                        setAssigning(c.id);
                                        setSelectedStaff(
                                          c.assignedTo || d.staffs[0]?.id || ""
                                        );
                                      }}
                                    >
                                      {c.assignedTo ? "Reassign" : "Assign"}
                                    </button>
                                  </div>
                                )}
                              </li>
                            ))}
                          </ul>
                        )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Department;
