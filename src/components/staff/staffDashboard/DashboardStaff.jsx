import { useState, useEffect } from "react";
import {
  CalendarClock,
  CheckCircle,
  Clock,
  AlertTriangle,
  XCircle,
  FileText,
  BarChart3,
  X,
  Calendar,
  MessageSquare,
  Clipboard,
  ArrowUpRight,
  MapPin,
  Bot,
  Brain,
  Loader,
} from "lucide-react";
import axios from "axios";

const DashboardStaff = ({ complaints, allocation }) => {
  console.log("allocation",allocation);
  console.log("complaints",complaints);
  const [complaintsData, setComplaintsData] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
    rejected: 0,
  });
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const port = import.meta.env.VITE_DB_PORT;

  useEffect(() => {
    let mergedComplaints = [];
    let allocMap = {};

    // Create a map of allocation data by ID
    if (allocation) {
      let allocArray = Array.isArray(allocation)
        ? allocation
        : Object.values(allocation);
      allocArray.forEach((alloc) => {
        if (alloc.id) allocMap[alloc.id] = alloc;
      });
    }

    // Merge complaints with allocation data
    if (complaints) {
      let compArray = Array.isArray(complaints)
        ? complaints
        : Object.values(complaints);
      compArray.forEach((comp) => {
        let merged = { ...comp };
        if (allocMap[comp.id]) {
          let alloc = allocMap[comp.id];
          merged.category = alloc.category || merged.category;
          merged.priority = alloc.priority || merged.priority;
          // Remove from map to avoid duplicate addition
          delete allocMap[comp.id];
        }
        mergedComplaints.push(merged);
      });
    }

    // Add remaining allocation entries that didn't match any complaints
    Object.values(allocMap).forEach((alloc) => {
      mergedComplaints.push(alloc);
    });

    // Filter out empty objects
    mergedComplaints = mergedComplaints.filter(
      (complaint) => complaint && Object.keys(complaint).length > 0
    );

    setComplaintsData(mergedComplaints);

    // Calculate statistics
    if (mergedComplaints.length > 0) {
      const statsCounts = {
        total: mergedComplaints.length,
        pending: 0,
        inProgress: 0,
        resolved: 0,
        rejected: 0,
      };

      mergedComplaints.forEach((complaint) => {
        if (complaint && complaint.status) {
          switch (complaint.status.toLowerCase()) {
            case "pending":
              statsCounts.pending++;
              break;
            case "in progress":
              statsCounts.inProgress++;
              break;
            case "resolved":
              statsCounts.resolved++;
              break;
            case "rejected":
              statsCounts.rejected++;
              break;
            default:
              statsCounts.pending++; // Default to pending if status is undefined
          }
        } else {
          statsCounts.pending++; // Default to pending if status is undefined
        }
      });

      setStats(statsCounts);
    }
  }, [complaints, allocation]);

  const getStatusBadge = (status) => {
    if (!status)
      return (
        <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 flex items-center">
          <Clock size={12} className="mr-1" /> Pending
        </span>
      );

    switch (status.toLowerCase()) {
      case "pending":
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 flex items-center">
            <Clock size={12} className="mr-1" /> Pending
          </span>
        );
      case "in progress":
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 flex items-center">
            <CalendarClock size={12} className="mr-1" /> In Progress
          </span>
        );
      case "resolved":
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 flex items-center">
            <CheckCircle size={12} className="mr-1" /> Resolved
          </span>
        );
      case "rejected":
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 flex items-center">
            <XCircle size={12} className="mr-1" /> Rejected
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800 flex items-center">
            <AlertTriangle size={12} className="mr-1" /> Unknown
          </span>
        );
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Function to update complaint status
  const updateComplaintStatus = async (complaintId, newStatus) => {
    setUpdating(true);
    try {
      // Get the specific complaint
      const response = await axios.get(
        `http://localhost:${port}/allocatedDepartment`
      );
      const allComplaints = response.data;

      // Find the complaint to update
      const complaintToUpdate = allComplaints.find((c) => c.id === complaintId);

      if (complaintToUpdate) {
        // Update the status
        complaintToUpdate.status = newStatus;

        // Save to database
        await axios.put(
          `http://localhost:${port}/allocatedDepartment/${complaintId}`,
          complaintToUpdate
        );

        // Update local data
        setComplaintsData((prevData) =>
          prevData.map((complaint) =>
            complaint.id === complaintId
              ? { ...complaint, status: newStatus }
              : complaint
          )
        );

        // Update selected complaint if it's open in modal
        if (selectedComplaint && selectedComplaint.id === complaintId) {
          setSelectedComplaint({ ...selectedComplaint, status: newStatus });
        }

        // Update stats
        setStats((prevStats) => {
          const newStats = { ...prevStats };

          // Decrement old status count (if it was a recognized status)
          if (
            complaintToUpdate.status &&
            complaintToUpdate.status.toLowerCase() === "pending"
          ) {
            newStats.pending = Math.max(0, newStats.pending - 1);
          } else if (
            complaintToUpdate.status &&
            complaintToUpdate.status.toLowerCase() === "in progress"
          ) {
            newStats.inProgress = Math.max(0, newStats.inProgress - 1);
          } else if (
            complaintToUpdate.status &&
            complaintToUpdate.status.toLowerCase() === "resolved"
          ) {
            newStats.resolved = Math.max(0, newStats.resolved - 1);
          } else if (
            complaintToUpdate.status &&
            complaintToUpdate.status.toLowerCase() === "rejected"
          ) {
            newStats.rejected = Math.max(0, newStats.rejected - 1);
          }

          // Increment new status count
          if (newStatus.toLowerCase() === "pending") {
            newStats.pending++;
          } else if (newStatus.toLowerCase() === "in progress") {
            newStats.inProgress++;
          } else if (newStatus.toLowerCase() === "resolved") {
            newStats.resolved++;
          } else if (newStatus.toLowerCase() === "rejected") {
            newStats.rejected++;
          }

          return newStats;
        });

        // Show success message
        setUpdateSuccess(true);
        setTimeout(() => setUpdateSuccess(false), 3000);
      }
    } catch (error) {
      console.error("Error updating complaint status:", error);
      alert("Failed to update status. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  // Department badge component
  const DepartmentBadge = ({ department }) => {
    // Define colors for different departments
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

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">
                Total Complaints
              </p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">
                {stats.total}
              </h3>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
              <FileText size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Pending</p>
              <h3 className="text-2xl font-bold text-yellow-600 mt-1">
                {stats.pending}
              </h3>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600">
              <Clock size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">In Progress</p>
              <h3 className="text-2xl font-bold text-blue-600 mt-1">
                {stats.inProgress}
              </h3>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
              <CalendarClock size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Resolved</p>
              <h3 className="text-2xl font-bold text-green-600 mt-1">
                {stats.resolved}
              </h3>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
              <CheckCircle size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Assigned Tasks Section - Grid View */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center">
            <BarChart3 className="mr-2 text-blue-600" size={20} />
            Your Assigned Tasks
          </h2>
        </div>

        <div className="p-4">
          {complaintsData.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {complaintsData.map((complaint, idx) => (
                <div
                  key={complaint?.id || idx}
                  className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => {
                    setSelectedComplaint(complaint);
                    setShowModal(true);
                  }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-800 truncate max-w-[70%]">
                      {complaint.title || "No Title"}
                    </h3>
                    {complaint.department && (
                      <DepartmentBadge department={complaint.department} />
                    )}
                  </div>

                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {complaint.details || "No details provided"}
                  </p>

                  {complaint.location && (
                    <div className="flex items-center text-xs text-gray-500 mb-2">
                      <MapPin className="w-4 h-4 mr-1" />
                      {complaint.location.municipality ||
                        complaint.location ||
                        "Unknown location"}
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      {complaint.category || "Uncategorized"}
                    </span>
                    {getStatusBadge(complaint.status)}
                  </div>

                  {complaint.photo && (
                    <div className="mt-3">
                      <img
                        src={complaint.photo}
                        alt="Complaint preview"
                        className="rounded-md border border-gray-300 w-full h-32 object-cover"
                      />
                    </div>
                  )}

                  {complaint.hasImage && !complaint.photo && (
                    <div className="mt-3 flex items-center text-blue-600 text-xs">
                      <FileText size={14} className="mr-1" />
                      Has supporting image (click to view details)
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center">
              <p className="text-gray-500">
                No complaints assigned to you yet.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {showModal && selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div
            className="relative bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              onClick={() => {
                setShowModal(false);
                setSelectedComplaint(null);
              }}
            >
              <X size={24} />
            </button>

            <div className="p-6">
              {selectedComplaint.photo && (
                <div className="mb-6">
                  <img
                    src={selectedComplaint.photo}
                    alt="Complaint"
                    className="rounded-md border border-gray-300 w-full h-64 object-cover"
                  />
                </div>
              )}

              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  {selectedComplaint.title || "Untitled Complaint"}
                </h2>
                {selectedComplaint.department && (
                  <DepartmentBadge department={selectedComplaint.department} />
                )}
              </div>

              {/* AI Analysis Section - Only show if available */}
              {selectedComplaint.analysis && (
                <div className="mb-6 bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                  <h3 className="text-sm font-semibold text-indigo-900 mb-2 flex items-center">
                    <Bot className="h-4 w-4 mr-2" />
                    AI Analysis
                  </h3>
                  <p className="text-indigo-800 text-sm">
                    {selectedComplaint.analysis}
                  </p>
                  {selectedComplaint.confidence && (
                    <div className="mt-2">
                      <span className="text-xs text-indigo-700">
                        Confidence Level: {selectedComplaint.confidence}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Complaint Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <FileText className="h-4 w-4 mr-2 text-blue-600" />
                    Complaint Information
                  </h3>
                  <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                    <div>
                      <p className="text-xs text-gray-500">ID</p>
                      <p className="font-medium text-sm">
                        {selectedComplaint.id}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Category</p>
                      <p className="font-medium text-sm">
                        {selectedComplaint.category || "Uncategorized"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Status</p>
                      <div className="mt-1">
                        {getStatusBadge(selectedComplaint.status)}
                      </div>
                    </div>
                    {selectedComplaint.priority && (
                      <div>
                        <p className="text-xs text-gray-500">Priority</p>
                        <p className="font-medium text-sm capitalize">
                          {selectedComplaint.priority}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-gray-500">Submitted On</p>
                      <p className="font-medium text-sm">
                        {formatDate(
                          selectedComplaint.createdAt ||
                            selectedComplaint.timestamp
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-blue-600" />
                    Location & Details
                  </h3>
                  <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                    {selectedComplaint.location && (
                      <div>
                        <p className="text-xs text-gray-500">Location</p>
                        <p className="font-medium text-sm">
                          {typeof selectedComplaint.location === "object"
                            ? `${selectedComplaint.location.address || ""}, ${
                                selectedComplaint.location.municipality || ""
                              }`
                            : selectedComplaint.location}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-gray-500">Description</p>
                      <p className="text-sm text-gray-700 mt-1">
                        {selectedComplaint.details || "No details provided"}
                      </p>
                    </div>
                    {selectedComplaint.hasImage && !selectedComplaint.photo && (
                      <div>
                        <p className="text-xs text-gray-500">Attachments</p>
                        <p className="text-sm text-blue-600 flex items-center mt-1">
                          <FileText size={14} className="mr-1" />
                          Supporting image available
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Questionnaire Responses */}
              {selectedComplaint.questionnaire && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <MessageSquare className="h-4 w-4 mr-2 text-green-600" />
                    Questionnaire Responses
                  </h3>

                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    {selectedComplaint.questionnaire.questions &&
                      selectedComplaint.questionnaire.answers && (
                        <div className="space-y-4">
                          {selectedComplaint.questionnaire.questions.map(
                            (question, index) => {
                              const answer =
                                selectedComplaint.questionnaire.answers[
                                  question
                                ];
                              return answer ? (
                                <div
                                  key={index}
                                  className="border-b border-green-200 pb-3"
                                >
                                  <p className="text-sm font-medium text-gray-700">
                                    {question}
                                  </p>
                                  <p className="mt-1 text-sm text-gray-600">
                                    {answer}
                                  </p>
                                </div>
                              ) : null;
                            }
                          )}
                        </div>
                      )}
                  </div>
                </div>
              )}

              {/* Staff Actions */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Staff Actions
                </h3>

                {updateSuccess && (
                  <div className="mb-3 p-2 bg-green-100 border border-green-300 text-green-700 rounded text-sm">
                    Status updated successfully!
                  </div>
                )}

                <div className="flex flex-wrap gap-3">
                  <button
                    className="px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50"
                    onClick={() =>
                      updateComplaintStatus(selectedComplaint.id, "In Progress")
                    }
                    disabled={
                      updating || selectedComplaint.status === "In Progress"
                    }
                  >
                    {updating ? (
                      <Loader className="mr-2 animate-spin" size={14} />
                    ) : (
                      <Calendar className="mr-2" size={14} />
                    )}
                    Mark In Progress
                  </button>

                  <button
                    className="px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors flex items-center disabled:opacity-50"
                    onClick={() =>
                      updateComplaintStatus(selectedComplaint.id, "Resolved")
                    }
                    disabled={
                      updating || selectedComplaint.status === "Resolved"
                    }
                  >
                    {updating ? (
                      <Loader className="mr-2 animate-spin" size={14} />
                    ) : (
                      <CheckCircle className="mr-2" size={14} />
                    )}
                    Mark as Resolved
                  </button>

                  <button
                    className="px-3 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors flex items-center disabled:opacity-50"
                    onClick={() =>
                      updateComplaintStatus(selectedComplaint.id, "Rejected")
                    }
                    disabled={
                      updating || selectedComplaint.status === "Rejected"
                    }
                  >
                    {updating ? (
                      <Loader className="mr-2 animate-spin" size={14} />
                    ) : (
                      <XCircle className="mr-2" size={14} />
                    )}
                    Reject Complaint
                  </button>

                  <button
                    className="px-3 py-2 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700 transition-colors flex items-center disabled:opacity-50"
                    onClick={() =>
                      updateComplaintStatus(selectedComplaint.id, "Pending")
                    }
                    disabled={
                      updating || selectedComplaint.status === "Pending"
                    }
                  >
                    {updating ? (
                      <Loader className="mr-2 animate-spin" size={14} />
                    ) : (
                      <ArrowUpRight className="mr-2" size={14} />
                    )}
                    Reset to Pending
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardStaff;
