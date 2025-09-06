"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Bot, LogOut, Menu, X, Loader2, Camera, Upload, MapPin, Clock, AlertCircle, CheckCircle, User, Bell, Shield, Zap, Send } from "lucide-react";

const Dashboard = () => {
  // State variables
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [category, setCategory] = useState("");
  const [department, setDepartment] = useState("");
  const [photo, setPhoto] = useState(null);
  const [photoMethod, setPhotoMethod] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [aiResults, setAiResults] = useState(null);
  const [complaints, setComplaints] = useState([
    {
      id: "1",
      title: "Pothole on Main Street",
      details: "Large pothole causing traffic issues and vehicle damage near City Mall intersection.",
      category: "Roads",
      department: "Municipal Works",
      status: "In Progress",
      priority: "high",
      createdAt: "2025-01-15T10:30:00Z",
      photo: null
    },
    {
      id: "2",
      title: "Street Light Not Working",
      details: "Street light has been out for 3 days on Park Avenue, creating safety concerns.",
      category: "Electricity",
      department: "Electricity Dept",
      status: "Submitted",
      priority: "medium",
      createdAt: "2025-01-14T15:20:00Z",
      photo: null
    },
    {
      id: "3",
      title: "Water Supply Issue",
      details: "No water supply in our area for the past 2 days. Multiple households affected.",
      category: "Water",
      department: "Water Dept",
      status: "Resolved",
      priority: "high",
      createdAt: "2025-01-12T08:45:00Z",
      photo: null
    }
  ]);
  const [complaintsLoading, setComplaintsLoading] = useState(false);
  const [complaintsError, setComplaintsError] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('submit');

  const webcamRef = useRef(null);

  // Mock user data
  const user = {
    name: "Rajesh Kumar",
    email: "rajesh.kumar@email.com",
    phone: "+91 98765 43210",
    municipality: "Ranchi Municipal Corporation"
  };

  // Function to handle photo upload
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();

      reader.onloadend = () => {
        setPhoto(reader.result);
        setPhotoMethod("upload");
      };

      reader.readAsDataURL(file);
    }
  };

  // Function to capture image from webcam
  const capture = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setCapturedImage(imageSrc);
      setPhotoMethod("camera");
      setShowCamera(false);
    }
  }, [webcamRef]);

  // Function to validate the form
  const validateForm = () => {
    const errors = {};
    if (!title.trim()) errors.title = "Title is required";
    if (!details.trim()) errors.details = "Details are required";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Function to handle form submission
  const handleSubmit = () => {
    if (!validateForm()) return;

    setIsAIProcessing(true);
    
    // Simulate AI processing
    setTimeout(() => {
      setAiResults({
        category: "Roads",
        department: "Municipal Works",
        priority: "high",
        confidence: "high"
      });
      setCategory("Roads");
      setDepartment("Municipal Works");
      setIsAIProcessing(false);
      
      // Add to complaints list
      const newComplaint = {
        id: Date.now().toString(),
        title,
        details,
        category: "Roads",
        department: "Municipal Works",
        status: "Submitted",
        priority: "high",
        createdAt: new Date().toISOString(),
        photo: photo || capturedImage
      };
      setComplaints(prev => [newComplaint, ...prev]);
      
      // Reset form
      setTitle("");
      setDetails("");
      setPhoto(null);
      setCapturedImage(null);
      setAiResults(null);
      
      // Switch to complaints tab
      setActiveTab('complaints');
    }, 2000);
  };

  const handleLogout = () => {
    // Simulate logout
    alert("Logged out successfully!");
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Resolved':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'In Progress':
        return <Clock className="w-4 h-4 text-blue-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const ComplaintCard = ({ item }) => {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
        <div className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 text-sm leading-tight mb-1">
                {item.title}
              </h4>
              <p className="text-xs text-gray-500 mb-2">
                {new Date(item.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
                </div>
              
            
            export default Dashboard;
            <div className="flex items-center space-x-1">
              {getStatusIcon(item.status)}
            </div>
          </div>
          
          <p className="text-xs text-gray-600 mb-3 line-clamp-2">
            {item.details}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full font-medium">
                {item.category}
              </span>
              <span className={`px-2 py-1 text-xs rounded-full font-medium border ${getPriorityColor(item.priority)}`}>
                {item.priority}
              </span>
            </div>
            <span className="text-xs text-gray-500 font-medium">
              #{item.id.slice(-4)}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  CivicMate
                </h1>
                <p className="text-xs text-gray-500 -mt-1">Smart Governance</p>
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Bell className="w-5 h-5 text-gray-600 hover:text-gray-900 cursor-pointer" />
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">Citizen</p>
                  </div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>

            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-gray-100 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-500">Citizen ID: #12345</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="sticky top-16 z-30 bg-white/90 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex space-x-1 py-3">
            <button
              onClick={() => setActiveTab('submit')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-all duration-200 ${
                activeTab === 'submit'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Submit Issue
            </button>
            <button
              onClick={() => setActiveTab('complaints')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-all duration-200 ${
                activeTab === 'complaints'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              My Issues ({complaints.length})
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6">
        {activeTab === 'submit' && (
          <div className="space-y-6">
            {/* Hero Section */}
            <div className="text-center py-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Report a Civic Issue
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Help improve your community by reporting issues. Our AI will automatically route your complaint to the right department.
              </p>
            </div>

            {/* AI Processing Banner */}
            {isAIProcessing && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-center justify-center space-x-3">
                  <div className="animate-spin">
                    <Loader2 className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-center">
                    <p className="text-blue-900 font-medium">AI is analyzing your report...</p>
                    <p className="text-blue-700 text-sm">Routing to appropriate department</p>
                  </div>
                </div>
              </div>
            )}

            {/* Form Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 space-y-6">
                {/* Title Field */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Issue Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      setFormErrors({...formErrors, title: undefined});
                    }}
                    placeholder="Brief description of the issue"
                    className={`w-full p-4 border rounded-xl text-sm bg-gray-50 focus:bg-white transition-colors ${
                      formErrors.title ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-blue-500"
                    } focus:ring-2 focus:ring-blue-500/20 focus:outline-none`}
                  />
                  {formErrors.title && (
                    <p className="mt-2 text-red-600 text-sm flex items-center space-x-1">
                      <AlertCircle className="w-4 h-4" />
                      <span>{formErrors.title}</span>
                    </p>
                  )}
                </div>

                {/* Details Field */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Detailed Description *
                  </label>
                  <textarea
                    value={details}
                    onChange={(e) => {
                      setDetails(e.target.value);
                      setFormErrors({...formErrors, details: undefined});
                    }}
                    placeholder="Provide detailed information about the issue, location, and impact"
                    rows={4}
                    className={`w-full p-4 border rounded-xl text-sm bg-gray-50 focus:bg-white transition-colors resize-none ${
                      formErrors.details ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-blue-500"
                    } focus:ring-2 focus:ring-blue-500/20 focus:outline-none`}
                  />
                  {formErrors.details && (
                    <p className="mt-2 text-red-600 text-sm flex items-center space-x-1">
                      <AlertCircle className="w-4 h-4" />
                      <span>{formErrors.details}</span>
                    </p>
                  )}
                </div>

                {/* AI Results */}
                {aiResults && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <Zap className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-green-900 mb-2">
                          AI Classification Complete
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-white rounded-lg p-3 border border-green-100">
                            <p className="text-xs text-green-600 font-medium mb-1">Category</p>
                            <p className="text-sm font-semibold text-green-900">{aiResults.category}</p>
                          </div>
                          <div className="bg-white rounded-lg p-3 border border-green-100">
                            <p className="text-xs text-green-600 font-medium mb-1">Department</p>
                            <p className="text-sm font-semibold text-green-900">{aiResults.department}</p>
                          </div>
                        </div>
                        <p className="text-xs text-green-700 mt-2">
                          Confidence: {aiResults.confidence} | Priority: {aiResults.priority}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Photo Upload */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Add Photo (Optional)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setShowCamera(true)}
                      className="flex items-center justify-center space-x-2 p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 group"
                    >
                      <Camera className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
                      <span className="text-sm font-medium text-gray-600 group-hover:text-blue-600">
                        Take Photo
                      </span>
                    </button>
                    
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                        id="photo-upload"
                      />
                      <label
                        htmlFor="photo-upload"
                        className="flex items-center justify-center space-x-2 p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 group cursor-pointer w-full"
                      >
                        <Upload className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
                        <span className="text-sm font-medium text-gray-600 group-hover:text-blue-600">
                          Upload Photo
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Photo Preview */}
                  {(capturedImage || photo) && (
                    <div className="mt-4">
                      <div className="relative inline-block">
                        <img
                          src={capturedImage || photo}
                          alt="Preview"
                          className="max-h-48 rounded-xl border border-gray-200 shadow-sm"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setCapturedImage(null);
                            setPhoto(null);
                            setPhotoMethod(null);
                          }}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-sm transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    onClick={handleSubmit}
                    disabled={isAIProcessing}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {isAIProcessing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Report</span>
                        <Send className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'complaints' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="text-center py-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Your Reported Issues
              </h2>
              <p className="text-gray-600">
                Track the progress of your civic complaints
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {complaints.filter(c => c.status === 'Submitted').length}
                </div>
                <div className="text-xs text-gray-600">Submitted</div>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {complaints.filter(c => c.status === 'In Progress').length}
                </div>
                <div className="text-xs text-gray-600">In Progress</div>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {complaints.filter(c => c.status === 'Resolved').length}
                </div>
                <div className="text-xs text-gray-600">Resolved</div>
              </div>
            </div>

            {/* Complaints List */}
            <div className="space-y-4">
              {complaints.map((complaint) => (
                <ComplaintCard key={complaint.id} item={complaint} />
              ))}
            </div>

            {complaints.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No issues reported yet</h3>
                <p className="text-gray-500 mb-4">Submit your first civic complaint to get started</p>
                <button
                  onClick={() => setActiveTab('submit')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
                >
                  Report an Issue
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Camera Modal */}
      {showCamera && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Take a Photo</h3>
            </div>
            <div className="p-4">
              <div className="aspect-video bg-gray-100 rounded-xl flex items-center justify-center">
                <Camera className="w-12 h-12 text-gray-400" />
                <p className="ml-2 text-gray-500">Camera preview would appear here</p>
              </div>
            </div>
            <div className="flex space-x-3 p-4 border-t border-gray-100">
              <button
                onClick={() => setShowCamera(false)}
                className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={capture}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
              >
                Capture
              </button>
            </div>
          </div>
        </div>
      )}
    </div>)}

    export default Dashboard;