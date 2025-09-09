import { useState, useMemo, useEffect } from "react";
import {
  MapPin,
  Calendar,
  User,
  FileText,
  Bot,
  Eye,
  Brain,
  Merge,
  UserCheck,
  AlertTriangle,
  Clock,
  CheckCircle,
} from "lucide-react";

const UnifiedComplaintsView = ({
  allocatedComplaints = [],
  complaints = [],
}) => {
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [staffList, setStaffList] = useState([]);
  const [managementMode, setManagementMode] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Fetch staff list on component mount
  useEffect(() => {
    const fetchStaffList = async () => {
      try {
        // Fetch staff data directly from staffs endpoint
        const staffResponse = await fetch(
          `https://jansamadhan-json-server.onrender.com/staffs`
        );
        const staffData = await staffResponse.json();

        // Extract unique staff members with their department info
        const uniqueStaff = staffData.map((staff) => ({
          id: staff.id,
          name: staff.name,
          responsibility: staff.responsibility,
          department: staff.departmentName,
          municipality: staff.municipality,
        }));

        setStaffList(uniqueStaff);
      } catch (error) {
        console.error("Error fetching staff list:", error);

        // Fallback: Try the old method as backup
        try {
          const response = await fetch(
            `https://jansamadhan-json-server.onrender.com/allocatedDepartment`
          );
          const departments = await response.json();

          // Extract all staff from all departments
          const allStaff = [];
          departments.forEach((dept) => {
            if (dept.staffs && Array.isArray(dept.staffs)) {
              dept.staffs.forEach((staff) => {
                allStaff.push({
                  ...staff,
                  department: dept.name,
                });
              });
            }
          });
          setStaffList(allStaff);
        } catch (fallbackError) {
          console.error("Error in fallback staff fetch:", fallbackError);
        }
      }
    };

    fetchStaffList();
  }, [port]);

  // Merge allocated complaints with original complaints data
  const mergedComplaints = useMemo(() => {
    return allocatedComplaints.map((allocated) => {
      // Find matching original complaint by ID or other matching criteria
      const originalComplaint = complaints.find((original) => {
        // Try to match by id first
        if (allocated.id && original.id && allocated.id === original.id)
          return true;

        // If no ID match, try to match by title and user email
        if (
          allocated.title &&
          original.title &&
          allocated.userInfo?.email &&
          original.contact?.email
        ) {
          return (
            allocated.title === original.title &&
            allocated.userInfo.email === original.contact.email
          );
        }

        // Fallback: match by title and timestamp proximity (within 1 hour)
        if (
          allocated.title &&
          original.title &&
          allocated.title === original.title
        ) {
          const allocatedTime = new Date(
            allocated.createdAt || allocated.timestamp
          );
          const originalTime = new Date(
            original.timestamp || original.createdAt
          );
          const timeDiff = Math.abs(allocatedTime - originalTime);
          return timeDiff < 3600000; // 1 hour in milliseconds
        }

        return false;
      });

      // Merge the data, prioritizing AI-processed data but including original details
      return {
        ...allocated,
        // Original complaint details
        originalContact: originalComplaint?.contact,
        originalLocation: originalComplaint?.location,
        originalTimestamp: originalComplaint?.timestamp,
        originalIssue: originalComplaint?.issue,
        originalDescription: originalComplaint?.description,
        originalPriority: originalComplaint?.priority,
        originalPhoto: originalComplaint?.photo,
        // Indicate if we found a match
        hasOriginalData: !!originalComplaint,
        originalComplaint: originalComplaint,
      };
    });
  }, [allocatedComplaints, complaints]);

  // Auto-allocation function based on department matching and workload
  const autoAllocateStaff = (complaint) => {
    if (complaint.assignedTo) {
      return complaint.assignedTo; // Already assigned
    }

    const complaintDepartment = complaint.department;
    if (!complaintDepartment) {
      return null; // No department identified
    }

    // Find staff members from the same department
    const departmentStaff = staffList.filter(
      (staff) => staff.department === complaintDepartment
    );

    if (departmentStaff.length === 0) {
      return null; // No staff available for this department
    }

    // Count current assignments for each staff member to distribute workload
    const staffWorkload = {};
    departmentStaff.forEach((staff) => {
      staffWorkload[staff.id] = mergedComplaints.filter(
        (c) => c.assignedTo === staff.id && c.status !== "Resolved"
      ).length;
    });

    // Find staff member with minimum workload
    const leastBusyStaff = departmentStaff.reduce((min, staff) => {
      const currentWorkload = staffWorkload[staff.id];
      const minWorkload = staffWorkload[min.id];
      return currentWorkload < minWorkload ? staff : min;
    });

    return leastBusyStaff.id;
  };

  // Apply auto-allocation when complaints and staff data are ready
  useEffect(() => {
    const applyAutoAllocation = async () => {
      if (staffList.length === 0) return;

      const unassignedComplaints = mergedComplaints.filter(
        (c) => !c.assignedTo
      );

      for (const complaint of unassignedComplaints) {
        const suggestedStaff = autoAllocateStaff(complaint);

        if (suggestedStaff) {
          try {
            console.log(
              `Auto-allocating ${suggestedStaff} to complaint ${complaint.id} (${complaint.department})`
            );
            // Auto-assign staff to unassigned complaints
            await assignStaff(complaint.id, suggestedStaff, true);
          } catch (error) {
            console.error("Error in auto-allocation:", error);
          }
        }
      }
    };

    // Only run auto-allocation if we have staff data and complaints
    if (staffList.length > 0 && mergedComplaints.length > 0) {
      applyAutoAllocation();
    }
  }, [staffList, mergedComplaints]);

  // Admin management functions
  const updateComplaintStatus = async (complaintId, newStatus) => {
    setUpdating(true);
    try {
      // Update in allocated complaints
      const allocatedResponse = await fetch(
        `https://jansamadhan-json-server.onrender.com/allocatedDepartment`
      );
      const allocatedData = await allocatedResponse.json();

      // Find and update the complaint
      const updatedAllocated = allocatedData.map((complaint) =>
        complaint.id === complaintId
          ? { ...complaint, status: newStatus }
          : complaint
      );

      // Update the allocated complaint
      const complaintToUpdate = updatedAllocated.find(
        (c) => c.id === complaintId
      );
      if (complaintToUpdate) {
        await fetch(
          `https://jansamadhan-json-server.onrender.com/allocatedDepartment/${complaintId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(complaintToUpdate),
          }
        );
      }

      // Also update in original complaints if it exists
      const originalComplaintsResponse = await fetch(
        `https://jansamadhan-json-server.onrender.com/complaints`
      );
      const originalData = await originalComplaintsResponse.json();
      const originalComplaint = originalData.find(
        (c) => c.id === complaintId || c.title === complaintToUpdate?.title
      );

      if (originalComplaint) {
        await fetch(
          `https://jansamadhan-json-server.onrender.com/complaints/${originalComplaint.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...originalComplaint, status: newStatus }),
          }
        );
      }

      alert("Status updated successfully!");
      window.location.reload(); // Refresh to show updated data
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Error updating status");
    } finally {
      setUpdating(false);
    }
  };

  const updateComplaintPriority = async (complaintId, newPriority) => {
    setUpdating(true);
    try {
      // Update in allocated complaints
      const allocatedResponse = await fetch(
        `https://jansamadhan-json-server.onrender.com/allocatedDepartment`
      );
      const allocatedData = await allocatedResponse.json();

      const updatedAllocated = allocatedData.map((complaint) =>
        complaint.id === complaintId
          ? { ...complaint, priority: newPriority }
          : complaint
      );

      const complaintToUpdate = updatedAllocated.find(
        (c) => c.id === complaintId
      );
      if (complaintToUpdate) {
        await fetch(
          `https://jansamadhan-json-server.onrender.com/allocatedDepartment/${complaintId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(complaintToUpdate),
          }
        );
      }

      // Also update in original complaints
      const originalComplaintsResponse = await fetch(
        `https://jansamadhan-json-server.onrender.com/complaints`
      );
      const originalData = await originalComplaintsResponse.json();
      const originalComplaint = originalData.find(
        (c) => c.id === complaintId || c.title === complaintToUpdate?.title
      );

      if (originalComplaint) {
        await fetch(
          `https://jansamadhan-json-server.onrender.com/complaints/${originalComplaint.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...originalComplaint,
              priority: newPriority,
            }),
          }
        );
      }

      alert("Priority updated successfully!");
      window.location.reload();
    } catch (error) {
      console.error("Error updating priority:", error);
      alert("Error updating priority");
    } finally {
      setUpdating(false);
    }
  };

  const assignStaff = async (
    complaintId,
    staffId,
    isAutoAssignment = false
  ) => {
    setUpdating(true);
    try {
      const allocatedResponse = await fetch(
        `https://jansamadhan-json-server.onrender.com/allocatedDepartment`
      );
      const allocatedData = await allocatedResponse.json();

      const updatedAllocated = allocatedData.map((complaint) =>
        complaint.id === complaintId
          ? { ...complaint, assignedTo: staffId }
          : complaint
      );

      const complaintToUpdate = updatedAllocated.find(
        (c) => c.id === complaintId
      );
      if (complaintToUpdate) {
        await fetch(
          `https://jansamadhan-json-server.onrender.com/allocatedDepartment/${complaintId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(complaintToUpdate),
          }
        );
      }

      if (!isAutoAssignment) {
        alert("Staff assigned successfully!");
        window.location.reload();
      }
    } catch (error) {
      console.error("Error assigning staff:", error);
      if (!isAutoAssignment) {
        alert("Error assigning staff");
      }
    } finally {
      setUpdating(false);
    }
  };

  const openModal = (complaint) => {
    setSelectedComplaint(complaint);
  };

  const closeModal = () => {
    setSelectedComplaint(null);
  };

  // Priority badge component
  const PriorityBadge = ({ priority }) => {
    const priorityColors = {
      high: "bg-red-100 text-red-800 border border-red-200",
      medium: "bg-yellow-100 text-yellow-800 border border-yellow-200",
      low: "bg-green-100 text-green-800 border border-green-200",
      Default: "bg-gray-100 text-gray-800 border border-gray-200",
    };

    const colorClass = priorityColors[priority] || priorityColors["Default"];

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}
      >
        {priority || "Not Set"}
      </span>
    );
  };

  // Assignment badge component
  const AssignmentBadge = ({ assignedTo, staffList }) => {
    const staff = staffList.find((s) => s.id === assignedTo);

    if (!assignedTo) {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
          Unassigned
        </span>
      );
    }

    return (
      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
        {staff?.name || assignedTo}
      </span>
    );
  };

  // Admin Management Panel Component
  const AdminManagementPanel = ({ complaint }) => {
    const assignedStaff = staffList.find((s) => s.id === complaint.assignedTo);
    const departmentStaff = staffList.filter(
      (s) => s.department === complaint.department
    );

    return (
      <div className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center">
          <UserCheck className="h-4 w-4 mr-2" />
          Admin Management Panel
        </h3>

        {/* Auto-allocation Status */}
        {complaint.assignedTo && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-center text-sm text-blue-800">
              <CheckCircle className="h-4 w-4 mr-2" />
              <span className="font-medium">Auto-Allocated:</span>
              <span className="ml-1">
                {assignedStaff?.name} ({assignedStaff?.department})
              </span>
            </div>
            <p className="text-xs text-blue-600 mt-1">
              Staff automatically assigned based on department matching
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Status Update */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">
              Update Status
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={complaint.status || "Pending"}
              onChange={(e) =>
                updateComplaintStatus(complaint.id, e.target.value)
              }
              disabled={updating}
            >
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {/* Priority Update */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">
              Set Priority
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={complaint.priority || "medium"}
              onChange={(e) =>
                updateComplaintPriority(complaint.id, e.target.value)
              }
              disabled={updating}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          {/* Staff Assignment/Reassignment */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">
              {complaint.assignedTo ? "Reassign Staff" : "Assign Staff"}
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={complaint.assignedTo || ""}
              onChange={(e) => assignStaff(complaint.id, e.target.value, false)}
              disabled={updating}
            >
              <option value="">
                {complaint.assignedTo
                  ? "Select Different Staff"
                  : "Select Staff Member"}
              </option>
              {/* Show department staff first */}
              {departmentStaff.length > 0 && (
                <optgroup label={`${complaint.department} Staff (Recommended)`}>
                  {departmentStaff.map((staff) => (
                    <option key={staff.id} value={staff.id}>
                      {staff.name} - {staff.responsibility}
                    </option>
                  ))}
                </optgroup>
              )}
              {/* Show all other staff */}
              <optgroup label="All Staff">
                {staffList.map((staff) => (
                  <option key={staff.id} value={staff.id}>
                    {staff.name} - {staff.responsibility} ({staff.department})
                  </option>
                ))}
              </optgroup>
            </select>
          </div>
        </div>

        {/* Department Match Info */}
        {departmentStaff.length > 0 && (
          <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded text-xs text-green-700">
            <span className="font-medium">
              ✓ {departmentStaff.length} staff member(s) available for{" "}
              {complaint.department}
            </span>
          </div>
        )}

        {departmentStaff.length === 0 && (
          <div className="mt-3 p-2 bg-orange-50 border border-orange-200 rounded text-xs text-orange-700">
            <span className="font-medium">
              ⚠ No dedicated staff found for {complaint.department}
            </span>
          </div>
        )}

        {updating && (
          <div className="mt-3 text-center">
            <span className="text-sm text-blue-600">Updating...</span>
          </div>
        )}
      </div>
    );
  };
  const DepartmentBadge = ({ department }) => {
    const departmentColors = {
      "Water Supply Department":
        "bg-blue-100 text-blue-800 border border-blue-200",
      "Water Dept": "bg-blue-100 text-blue-800 border border-blue-200",
      "Electricity Department":
        "bg-yellow-100 text-yellow-800 border border-yellow-200",
      "Electricity Dept":
        "bg-yellow-100 text-yellow-800 border border-yellow-200",
      "Roads & Transport Department":
        "bg-orange-100 text-orange-800 border border-orange-200",
      "Municipal Works":
        "bg-orange-100 text-orange-800 border border-orange-200",
      "Sanitation & Waste Management Department":
        "bg-green-100 text-green-800 border border-green-200",
      "Sanitation Dept": "bg-green-100 text-green-800 border border-green-200",
      "Public Health Department":
        "bg-red-100 text-red-800 border border-red-200",
      "Fire & Emergency Services":
        "bg-red-100 text-red-800 border border-red-200",
      "Parks & Recreation Department":
        "bg-emerald-100 text-emerald-800 border border-emerald-200",
      "Revenue & Taxation Department":
        "bg-purple-100 text-purple-800 border border-purple-200",
      "Education & Libraries Department":
        "bg-indigo-100 text-indigo-800 border border-indigo-200",
      "General Admin": "bg-gray-100 text-gray-800 border border-gray-200",
      Default: "bg-gray-100 text-gray-800 border border-gray-200",
    };

    const colorClass =
      departmentColors[department] || departmentColors["Default"];

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}
      >
        {department}
      </span>
    );
  };

  // Status indicator component
  const StatusIndicator = ({ status }) => {
    let statusColors = {
      Resolved: "bg-green-500",
      "In Progress": "bg-blue-500",
      Pending: "bg-orange-500",
      Rejected: "bg-red-500",
      Default: "bg-gray-500",
    };

    const colorClass = statusColors[status] || statusColors["Default"];

    return (
      <div className="flex items-center mt-2">
        <div className={`w-2 h-2 rounded-full mr-1 ${colorClass}`}></div>
        <span className="text-xs text-gray-600">{status}</span>
      </div>
    );
  };

  return (
    <div className="space-y-6 p-4">
      {/* Welcome Banner */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Merge className="h-5 w-5 text-indigo-600 mr-2" />
            <p className="text-indigo-800 font-medium">
              Unified Complaints View - Complete Admin Management
            </p>
          </div>
          <button
            onClick={() => setManagementMode(!managementMode)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              managementMode
                ? "bg-indigo-600 text-white"
                : "bg-white text-indigo-600 border border-indigo-200"
            }`}
          >
            {managementMode ? "Hide" : "Show"} Management Panel
          </button>
        </div>
        <p className="text-indigo-700 text-sm mt-1">
          AI-processed complaints merged with original data for complete context
          and easy management.
        </p>
      </div>

      {/* Statistics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg mr-3">
              <Brain className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Merged</p>
              <p className="text-xl font-bold text-gray-900">
                {mergedComplaints.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg mr-3">
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">High Priority</p>
              <p className="text-xl font-bold text-gray-900">
                {mergedComplaints.filter((c) => c.priority === "high").length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg mr-3">
              <Clock className="h-4 w-4 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Unassigned</p>
              <p className="text-xl font-bold text-gray-900">
                {mergedComplaints.filter((c) => !c.assignedTo).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg mr-3">
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Resolved</p>
              <p className="text-xl font-bold text-gray-900">
                {mergedComplaints.filter((c) => c.status === "Resolved").length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Complaints Grid */}
      <div className="mt-6">
        {mergedComplaints.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 text-yellow-800">
            No complaints found for your district and pincode.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mergedComplaints.map((complaint, idx) => (
              <div
                key={complaint.id || idx}
                className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer relative"
                onClick={() => openModal(complaint)}
              >
                {/* Data completeness indicator */}
                <div className="absolute top-2 right-2 flex space-x-1">
                  <div
                    className="w-2 h-2 bg-indigo-500 rounded-full"
                    title="AI Processed"
                  ></div>
                  {complaint.hasOriginalData && (
                    <div
                      className="w-2 h-2 bg-blue-500 rounded-full"
                      title="Original Data Available"
                    ></div>
                  )}
                </div>

                <div className="flex justify-between items-start mb-2 pr-8">
                  <h3 className="font-semibold text-gray-800 truncate max-w-[70%]">
                    {complaint.title}
                  </h3>
                  <DepartmentBadge department={complaint.department} />
                </div>

                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {complaint.analysis ||
                    complaint.details ||
                    complaint.originalDescription}
                </p>

                <div className="flex items-center text-xs text-gray-500 mb-2">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    ></path>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    ></path>
                  </svg>
                  {complaint.location?.municipality ||
                    complaint.originalLocation?.municipality ||
                    "Unknown location"}
                </div>

                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-gray-500">
                    {complaint.category}
                  </span>
                  <StatusIndicator status={complaint.status} />
                </div>

                {/* Priority and Assignment Row */}
                <div className="flex justify-between items-center mb-2">
                  <PriorityBadge priority={complaint.priority} />
                  <div className="flex items-center space-x-2">
                    <AssignmentBadge
                      assignedTo={complaint.assignedTo}
                      staffList={staffList}
                    />
                    {/* Auto-allocation indicator */}
                    {complaint.assignedTo && (
                      <span className="px-1 py-0.5 rounded text-xs bg-green-100 text-green-700 border border-green-200">
                        Auto
                      </span>
                    )}
                  </div>
                </div>

                {/* Show confidence score if available */}
                {complaint.confidence && (
                  <div className="mt-2 bg-indigo-50 px-2 py-1 rounded text-xs">
                    <span className="text-indigo-700">
                      AI Confidence: {Math.round(complaint.confidence * 100)}%
                    </span>
                  </div>
                )}

                {(complaint.photo || complaint.originalPhoto) && (
                  <div className="mt-3">
                    <img
                      src={complaint.photo || complaint.originalPhoto}
                      alt="Complaint preview"
                      className="rounded-md border border-gray-300 w-full h-32 object-cover"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Unified Detail Modal */}
      {selectedComplaint && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-transparent backdrop-blur-xs bg-opacity-70"
          onClick={closeModal}
        >
          <div
            className="relative bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl z-10"
              onClick={closeModal}
            >
              &times;
            </button>

            <div className="p-6">
              {/* Photos */}
              {(selectedComplaint.photo || selectedComplaint.originalPhoto) && (
                <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedComplaint.photo && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-600 mb-2">
                        AI Processed Image
                      </h4>
                      <img
                        src={selectedComplaint.photo}
                        alt="AI Processed"
                        className="rounded-md border border-gray-300 w-full h-48 object-cover"
                      />
                    </div>
                  )}
                  {selectedComplaint.originalPhoto &&
                    selectedComplaint.originalPhoto !==
                      selectedComplaint.photo && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-600 mb-2">
                          Original Submission
                        </h4>
                        <img
                          src={selectedComplaint.originalPhoto}
                          alt="Original"
                          className="rounded-md border border-gray-300 w-full h-48 object-cover"
                        />
                      </div>
                    )}
                </div>
              )}

              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                  {selectedComplaint.title}
                </h2>
                <div className="flex items-center space-x-2">
                  <DepartmentBadge department={selectedComplaint.department} />
                  {selectedComplaint.hasOriginalData && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      Complete Data
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* AI Analysis Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-indigo-900 border-b pb-2">
                    AI Analysis & Processing
                  </h3>

                  {selectedComplaint.analysis && (
                    <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                      <h4 className="text-sm font-semibold text-indigo-900 mb-2 flex items-center">
                        <Bot className="h-4 w-4 mr-2" />
                        Detailed Analysis
                      </h4>
                      <p className="text-indigo-800 text-sm">
                        {selectedComplaint.analysis}
                      </p>
                      {selectedComplaint.confidence && (
                        <div className="mt-2">
                          <span className="text-xs text-indigo-700">
                            Confidence Score:{" "}
                            {Math.round(selectedComplaint.confidence * 100)}%
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {selectedComplaint.questionnaire &&
                    selectedComplaint.questionnaire.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-600 mb-3 flex items-center">
                          <FileText className="h-4 w-4 mr-2" />
                          Questionnaire Responses
                        </h4>
                        <div className="space-y-2">
                          {selectedComplaint.questionnaire.map((qa, index) => (
                            <div
                              key={index}
                              className="bg-gray-50 p-3 rounded-lg"
                            >
                              <p className="font-medium text-gray-800 text-sm mb-1">
                                {qa.question}
                              </p>
                              <p className="text-gray-600 text-sm">
                                {qa.answer}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </div>

                {/* Original Submission Data */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-blue-900 border-b pb-2">
                    Original Submission Details
                  </h3>

                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-600 mb-1">
                        Category & Status
                      </h4>
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-sm">
                          <span className="font-medium">Category:</span>{" "}
                          {selectedComplaint.category}
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">Status:</span>{" "}
                          {selectedComplaint.status}
                        </p>
                        {selectedComplaint.originalPriority && (
                          <p className="text-sm">
                            <span className="font-medium">Priority:</span>{" "}
                            {selectedComplaint.originalPriority}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-gray-600 mb-1">
                        Contact Information
                      </h4>
                      <div className="bg-blue-50 p-3 rounded-lg">
                        {selectedComplaint.userInfo && (
                          <>
                            <p className="text-sm">
                              <span className="font-medium">Name:</span>{" "}
                              {selectedComplaint.userInfo.name}
                            </p>
                            <p className="text-sm">
                              <span className="font-medium">Email:</span>{" "}
                              {selectedComplaint.userInfo.email}
                            </p>
                          </>
                        )}
                        {selectedComplaint.originalContact && (
                          <>
                            <p className="text-sm">
                              <span className="font-medium">Phone:</span>{" "}
                              {selectedComplaint.originalContact.phone}
                            </p>
                            {selectedComplaint.originalContact.email && (
                              <p className="text-sm">
                                <span className="font-medium">Alt Email:</span>{" "}
                                {selectedComplaint.originalContact.email}
                              </p>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-gray-600 mb-1">
                        Location Details
                      </h4>
                      <div className="bg-blue-50 p-3 rounded-lg">
                        {selectedComplaint.location && (
                          <>
                            <p className="text-sm">
                              <span className="font-medium">Address:</span>{" "}
                              {selectedComplaint.location.address}
                            </p>
                            <p className="text-sm">
                              <span className="font-medium">Municipality:</span>{" "}
                              {selectedComplaint.location.municipality}
                            </p>
                          </>
                        )}
                        {selectedComplaint.originalLocation && (
                          <>
                            <p className="text-sm">
                              <span className="font-medium">District:</span>{" "}
                              {selectedComplaint.originalLocation.district}
                            </p>
                            <p className="text-sm">
                              <span className="font-medium">Area:</span>{" "}
                              {selectedComplaint.originalLocation.area}
                            </p>
                          </>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-gray-600 mb-1">
                        Timestamps
                      </h4>
                      <div className="bg-blue-50 p-3 rounded-lg">
                        {selectedComplaint.createdAt && (
                          <p className="text-sm">
                            <span className="font-medium">AI Processed:</span>{" "}
                            {new Date(
                              selectedComplaint.createdAt
                            ).toLocaleString()}
                          </p>
                        )}
                        {selectedComplaint.originalTimestamp && (
                          <p className="text-sm">
                            <span className="font-medium">
                              Originally Submitted:
                            </span>{" "}
                            {new Date(
                              selectedComplaint.originalTimestamp
                            ).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Combined Description */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Complete Description
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedComplaint.details && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-600 mb-2">
                        Current Details
                      </h4>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-gray-800 text-sm">
                          {selectedComplaint.details}
                        </p>
                      </div>
                    </div>
                  )}
                  {selectedComplaint.originalDescription &&
                    selectedComplaint.originalDescription !==
                      selectedComplaint.details && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-600 mb-2">
                          Original Description
                        </h4>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-gray-800 text-sm">
                            {selectedComplaint.originalDescription}
                          </p>
                        </div>
                      </div>
                    )}
                </div>
              </div>

              {/* Admin Management Panel */}
              {managementMode && (
                <AdminManagementPanel complaint={selectedComplaint} />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UnifiedComplaintsView;
