import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, MapPin, Clock, AlertCircle, Megaphone } from "lucide-react";
import BottomNavigation from "../../components/BottomNavigation";

const HomeScreen = () => {
  const navigate = useNavigate();
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost";

  const [user, setUser] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [areaComplaints, setAreaComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [announcements] = useState([
    {
      id: 1,
      title: "Municipal Water Supply Maintenance",
      content:
        "Water supply will be disrupted from 10 AM to 4 PM tomorrow for maintenance work.",
      type: "info",
      date: new Date().toISOString(),
    },
    {
      id: 2,
      title: "Road Construction Alert",
      content:
        "Main Street road construction in progress. Please use alternate routes.",
      type: "warning",
      date: new Date().toISOString(),
    },
  ]);

  useEffect(() => {
    const storedUser = sessionStorage.getItem("civicName");
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      fetchUserComplaints(userData.email);
      fetchAreaComplaints(userData.municipality);
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const fetchUserComplaints = async (email) => {
    try {
      const response = await fetch(
        `https://jansamadhan-json-server.onrender.com/complaints?userInfo.email=${encodeURIComponent(
          email
        )}`
      );
      if (response.ok) {
        const data = await response.json();
        setComplaints(Array.isArray(data) ? data.slice(0, 3) : []); // Show only recent 3
      }
    } catch (error) {
      console.error("Error fetching user complaints:", error);
    }
  };

  const fetchAreaComplaints = async (municipality) => {
    try {
      const response = await fetch(
        `https://jansamadhan-json-server.onrender.com/complaints?userInfo.municipality=${encodeURIComponent(
          municipality
        )}`
      );
      if (response.ok) {
        const data = await response.json();
        // Filter out user's own complaints and show recent 3
        const otherComplaints = Array.isArray(data)
          ? data
              .filter((complaint) => complaint.userInfo?.email !== user?.email)
              .slice(0, 3)
          : [];
        setAreaComplaints(otherComplaints);
      }
    } catch (error) {
      console.error("Error fetching area complaints:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return date.toLocaleDateString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Submitted":
        return "bg-yellow-100 text-yellow-800";
      case "In Progress":
        return "bg-blue-100 text-blue-800";
      case "Resolved":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const ReportCard = ({ report, onClick }) => (
    <div
      className="bg-white rounded-lg border p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start space-x-3">
        {(report.photo || report.capturedImage) && (
          <img
            src={report.photo || report.capturedImage}
            alt="Report"
            className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
          />
        )}
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 truncate">{report.title}</h4>
          <p className="text-sm text-gray-600 line-clamp-2 mt-1">
            {report.details}
          </p>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center space-x-2">
              <span
                className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                  report.status
                )}`}
              >
                {report.status}
              </span>
              <span
                className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(
                  report.priority
                )}`}
              >
                {report.priority || "medium"}
              </span>
            </div>
            <span className="text-xs text-gray-500 flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              {formatDate(report.createdAt)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Hello, {user?.name || "User"}! 👋
              </h1>
              <p className="text-gray-600 mt-1">
                {user?.municipality}, {user?.district}
              </p>
            </div>
            <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200">
              <Bell className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>
      </header>

      <main className="px-4 py-6 space-y-6">
        {/* Announcements Section */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
            <Megaphone className="w-5 h-5 mr-2 text-blue-600" />
            Announcements
          </h2>
          <div className="space-y-3">
            {announcements.map((announcement) => (
              <div
                key={announcement.id}
                className={`p-4 rounded-lg border-l-4 ${
                  announcement.type === "warning"
                    ? "bg-amber-50 border-amber-400"
                    : "bg-blue-50 border-blue-400"
                }`}
              >
                <div className="flex items-start space-x-3">
                  {announcement.type === "warning" ? (
                    <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  ) : (
                    <Bell className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">
                      {announcement.title}
                    </h3>
                    <p className="text-sm text-gray-700 mt-1">
                      {announcement.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Your Reports Section */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900">
              Your Reports
            </h2>
            <button
              onClick={() => navigate("/posts")}
              className="text-blue-600 text-sm font-medium hover:text-blue-700"
            >
              View All
            </button>
          </div>

          {complaints.length > 0 ? (
            <div className="space-y-3">
              {complaints.map((report) => (
                <ReportCard
                  key={report.id}
                  report={report}
                  onClick={() => navigate(`/report/${report.id}`)}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg border p-6 text-center">
              <p className="text-gray-500">No reports yet.</p>
              <button
                onClick={() => navigate("/create-post")}
                className="mt-2 text-blue-600 font-medium hover:text-blue-700"
              >
                Create your first report
              </button>
            </div>
          )}
        </section>

        {/* Area Activity Section */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-green-600" />
              Recent Area Activity
            </h2>
            <button
              onClick={() => navigate("/posts")}
              className="text-blue-600 text-sm font-medium hover:text-blue-700"
            >
              View All
            </button>
          </div>

          {areaComplaints.length > 0 ? (
            <div className="space-y-3">
              {areaComplaints.map((report) => (
                <ReportCard
                  key={report.id}
                  report={report}
                  onClick={() => navigate(`/report/${report.id}`)}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg border p-6 text-center">
              <p className="text-gray-500">No recent activity in your area.</p>
            </div>
          )}
        </section>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default HomeScreen;
