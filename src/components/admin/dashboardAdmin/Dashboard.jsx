import React, { useState } from "react";

const Dashboard = ({ complaints }) => {
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  const openModal = (complaint) => {
    setSelectedComplaint(complaint);
  };

  const closeModal = () => {
    setSelectedComplaint(null);
  };

  // Department badge component
  const DepartmentBadge = ({ department }) => {
    // Define colors for different departments
    const departmentColors = {
      "Water Department": "bg-blue-100 text-blue-800 border border-blue-200",
      "Electricity Board": "bg-yellow-100 text-yellow-800 border border-yellow-200",
      "Road Transport": "bg-orange-100 text-orange-800 border border-orange-200",
      "Sanitation": "bg-green-100 text-green-800 border border-green-200",
      "Public Works": "bg-purple-100 text-purple-800 border border-purple-200",
      "Health Department": "bg-red-100 text-red-800 border border-red-200",
      "Education": "bg-indigo-100 text-indigo-800 border border-indigo-200",
      "Default": "bg-gray-100 text-gray-800 border border-gray-200"
    };
    
    const colorClass = departmentColors[department] || departmentColors["Default"];
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
        {department}
      </span>
    );
  };

  // Status indicator component (smaller, less prominent)
  const StatusIndicator = ({ status }) => {
    let statusColors = {
      "Resolved": "bg-green-500",
      "In Progress": "bg-blue-500",
      "Pending": "bg-orange-500",
      "Rejected": "bg-red-500",
      "Default": "bg-gray-500"
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
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
        <p className="text-blue-800">
          Welcome to the Jharkhand Government Admin Dashboard. Manage your
          government services and applications here.
        </p>
      </div>

      {/* Complaints Section */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">
          Complaints in your area
        </h2>
        
        {complaints.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 text-yellow-800">
            No complaints found for your district and pincode.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {complaints.map((complaint, idx) => (
              <div
                key={complaint.id || idx}
                className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => openModal(complaint)}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-800 truncate max-w-[70%]">{complaint.title}</h3>
                  <DepartmentBadge department={complaint.department} />
                </div>
                
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{complaint.details}</p>
                
                <div className="flex items-center text-xs text-gray-500 mb-2">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                  {complaint.location?.municipality || "Unknown location"}
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">{complaint.category}</span>
                  <StatusIndicator status={complaint.status} />
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
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Complaint Detail Modal */}
      {selectedComplaint && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70"
          onClick={closeModal}
        >
          <div 
            className="relative bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl"
              onClick={closeModal}
            >
              &times;
            </button>
            
            <div className="p-6">
              {selectedComplaint.photo && (
                <div className="mb-4">
                  <img
                    src={selectedComplaint.photo}
                    alt="Complaint"
                    className="rounded-md border border-gray-300 w-full h-64 object-cover"
                  />
                </div>
              )}
              
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-gray-800">{selectedComplaint.title}</h2>
                <DepartmentBadge department={selectedComplaint.department} />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 mb-1">Category</h3>
                  <p className="text-gray-800">{selectedComplaint.category}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 mb-1">Status</h3>
                  <p className="text-gray-800">{selectedComplaint.status}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 mb-1">Submitted On</h3>
                  <p className="text-gray-800">
                    {selectedComplaint.createdAt ? new Date(selectedComplaint.createdAt).toLocaleString() : ""}
                  </p>
                </div>
                
                {selectedComplaint.userInfo && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-600 mb-1">Submitted By</h3>
                    <p className="text-gray-800">{selectedComplaint.userInfo.name}</p>
                  </div>
                )}
              </div>
              
              {selectedComplaint.location && (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-gray-600 mb-1">Location</h3>
                  <p className="text-gray-800">
                    {selectedComplaint.location.address}, {selectedComplaint.location.municipality}
                  </p>
                </div>
              )}
              
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-600 mb-1">Details</h3>
                <p className="text-gray-800">{selectedComplaint.details}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;