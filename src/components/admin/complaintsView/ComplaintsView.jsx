import { useState } from 'react';
import { MapPin, Calendar, User, FileText, Bot, Eye, Brain } from 'lucide-react';

const ComplaintsView = ({ allocatedComplaints = [], complaints = [] }) => {
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [activeView, setActiveView] = useState("processed"); // "processed" or "original"

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
      "Water Supply Department": "bg-blue-100 text-blue-800 border border-blue-200",
      "Water Dept": "bg-blue-100 text-blue-800 border border-blue-200",
      "Electricity Department": "bg-yellow-100 text-yellow-800 border border-yellow-200",
      "Electricity Dept": "bg-yellow-100 text-yellow-800 border border-yellow-200",
      "Roads & Transport Department": "bg-orange-100 text-orange-800 border border-orange-200",
      "Municipal Works": "bg-orange-100 text-orange-800 border border-orange-200",
      "Sanitation & Waste Management Department": "bg-green-100 text-green-800 border border-green-200",
      "Sanitation Dept": "bg-green-100 text-green-800 border border-green-200",
      "Public Health Department": "bg-red-100 text-red-800 border border-red-200",
      "Fire & Emergency Services": "bg-red-100 text-red-800 border border-red-200",
      "Parks & Recreation Department": "bg-emerald-100 text-emerald-800 border border-emerald-200",
      "Revenue & Taxation Department": "bg-purple-100 text-purple-800 border border-purple-200",
      "Education & Libraries Department": "bg-indigo-100 text-indigo-800 border border-indigo-200",
      "General Admin": "bg-gray-100 text-gray-800 border border-gray-200",
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
    <div className="space-y-6">
      {/* View Toggle */}
      <div className="flex items-center space-x-4 mb-6">
        <button
          onClick={() => setActiveView("processed")}
          className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
            activeView === "processed"
              ? "bg-indigo-100 text-indigo-800 border border-indigo-200"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          <Brain className="h-4 w-4 mr-2" />
          AI-Processed Complaints ({allocatedComplaints.length})
        </button>
        <button
          onClick={() => setActiveView("original")}
          className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
            activeView === "original"
              ? "bg-blue-100 text-blue-800 border border-blue-200"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          <Eye className="h-4 w-4 mr-2" />
          Original Complaints ({complaints.length})
        </button>
      </div>

      {/* Complaints Section */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">
          {activeView === "processed" ? "AI-Processed Complaints" : "Original Complaints"} in your area
        </h2>
        
        {(() => {
          const currentData = activeView === "processed" ? allocatedComplaints : complaints;
          return currentData.length === 0 ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 text-yellow-800">
              No {activeView === "processed" ? "processed" : "original"} complaints found for your district and pincode.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentData.map((complaint, idx) => (
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
        );
        })()}
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
              
              {/* AI Analysis Section - Only for processed complaints */}
              {activeView === "processed" && selectedComplaint.analysis && (
                <div className="mb-6 bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                  <h3 className="text-sm font-semibold text-indigo-900 mb-2 flex items-center">
                    <Bot className="h-4 w-4 mr-2" />
                    AI Analysis
                  </h3>
                  <p className="text-indigo-800 text-sm">{selectedComplaint.analysis}</p>
                  {selectedComplaint.confidence && (
                    <div className="mt-2">
                      <span className="text-xs text-indigo-700">
                        Confidence Score: {Math.round(selectedComplaint.confidence * 100)}%
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Questionnaire Responses - Only for processed complaints */}
              {activeView === "processed" && selectedComplaint.questionnaire && selectedComplaint.questionnaire.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-600 mb-3 flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    Questionnaire Responses
                  </h3>
                  <div className="space-y-2">
                    {selectedComplaint.questionnaire.map((qa, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-lg">
                        <p className="font-medium text-gray-800 text-sm mb-1">{qa.question}</p>
                        <p className="text-gray-600 text-sm">{qa.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Original Complaint Info - Show different fields based on view */}
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
                    {selectedComplaint.createdAt ? 
                      new Date(selectedComplaint.createdAt).toLocaleString() : 
                      selectedComplaint.timestamp ? 
                        new Date(selectedComplaint.timestamp).toLocaleString() : 
                        "N/A"}
                  </p>
                </div>
                
                {selectedComplaint.userInfo && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-600 mb-1">Submitted By</h3>
                    <p className="text-gray-800">{selectedComplaint.userInfo.name}</p>
                    {selectedComplaint.userInfo.email && (
                      <p className="text-gray-600 text-xs">{selectedComplaint.userInfo.email}</p>
                    )}
                  </div>
                )}

                {/* Show contact info for original complaints */}
                {activeView === "original" && selectedComplaint.contact && (
                  <>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-600 mb-1">Phone</h3>
                      <p className="text-gray-800">{selectedComplaint.contact.phone}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-600 mb-1">Email</h3>
                      <p className="text-gray-800">{selectedComplaint.contact.email}</p>
                    </div>
                  </>
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

export default ComplaintsView;
