import React, { useEffect, useState } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Outdent,
  LogOut,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [name, setName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let admin = sessionStorage.getItem("adminName");
    if (admin == null) {
      navigate("/admin/login");
    } else {
      setName(admin);
    }
  }, []);

  const menuItems = [
    "Dashboard",
    "Departments",
    "Map",
    "Updates",
    "Announcements",
    "Settings",
  ];
  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Browser-like header */}
      <div className="fixed top-0 left-0 right-0 h-12 bg-gray-900 border-b border-gray-700 flex items-center px-4 z-10">
        <div className="flex-1 bg-gray-800 rounded-md px-3 py-1 text-xl font-bold text-center text-gray-300">
          Government of Jharkhand
        </div>
        <div className="ml-2 ">
          <button
            onClick={() => navigate("/admin/login")}
            className="cursor-pointer"
          >
            <LogOut className="w-5 h-5 text-gray-400 hover:text-red-500" />
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-48 bg-gray-900 border-r border-gray-700 pt-12 min-h-screen">
        <div className="p-4">
          <button className="bg-gray-800 text-white px-4 py-2 rounded-md text-sm border border-gray-600 mb-6 hover:bg-gray-700 transition-colors">
            {name}
          </button>
        </div>

        <nav className="px-2">
          {menuItems.map((item) => (
            <button
              key={item}
              onClick={() => setActiveTab(item)}
              className={`w-full text-left px-4 py-3 text-sm rounded-md mb-1 transition-colors ${
                activeTab === item
                  ? "bg-gray-800 text-white border-l-2 border-blue-500"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}
            >
              {item}
            </button>
          ))}
        </nav>
      </div>

      {/* Main content area */}
      <div className="flex-1 pt-12">
        <div className="p-6 h-full">
          <div className="bg-gray-900 border border-gray-700 rounded-lg h-full min-h-96">
            <div className="p-6">
              <h1 className="text-2xl font-bold mb-4">
                Welcome to {activeTab}
              </h1>

              {activeTab === "Dashboard" && (
                <div className="space-y-6">
                  <p className="text-gray-300">
                    Welcome to the Jharkhand Government Admin Dashboard. Manage
                    your government services and applications here.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-gray-800 p-4 rounded-lg border border-gray-600">
                      <h3 className="text-lg font-semibold mb-2">
                        Quick Stats
                      </h3>
                      <p className="text-gray-300">View system statistics</p>
                    </div>

                    <div className="bg-gray-800 p-4 rounded-lg border border-gray-600">
                      <h3 className="text-lg font-semibold mb-2">
                        Recent Activity
                      </h3>
                      <p className="text-gray-300">Monitor recent changes</p>
                    </div>

                    <div className="bg-gray-800 p-4 rounded-lg border border-gray-600">
                      <h3 className="text-lg font-semibold mb-2">
                        System Health
                      </h3>
                      <p className="text-gray-300">Check system status</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "Departments" && (
                <div>
                  <p className="text-gray-300 mb-4">
                    Manage government departments and their administrators.
                  </p>
                  <div className="bg-gray-800 p-4 rounded-lg border border-gray-600">
                    <h3 className="text-lg font-semibold mb-2">
                      Department Management
                    </h3>
                    <p className="text-gray-400">
                      Add, edit, or remove departments
                    </p>
                  </div>
                </div>
              )}

              {activeTab === "Map" && (
                <div>
                  <p className="text-gray-300 mb-4">
                    View geographical data and location-based services.
                  </p>
                  <div className="bg-gray-800 p-4 rounded-lg border border-gray-600 h-64 flex items-center justify-center">
                    <p className="text-gray-400">
                      Map visualization would appear here
                    </p>
                  </div>
                </div>
              )}

              {activeTab === "Updates" && (
                <div>
                  <p className="text-gray-300 mb-4">
                    Manage system updates and maintenance schedules.
                  </p>
                  <div className="space-y-4">
                    <div className="bg-gray-800 p-4 rounded-lg border border-gray-600">
                      <h3 className="text-lg font-semibold mb-2">
                        System Updates
                      </h3>
                      <p className="text-gray-400">No pending updates</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "Announcements" && (
                <div>
                  <p className="text-gray-300 mb-4">
                    Create and manage public announcements.
                  </p>
                  <div className="bg-gray-800 p-4 rounded-lg border border-gray-600">
                    <h3 className="text-lg font-semibold mb-2">
                      Recent Announcements
                    </h3>
                    <p className="text-gray-400">No recent announcements</p>
                  </div>
                </div>
              )}

              {activeTab === "Settings" && (
                <div>
                  <p className="text-gray-300 mb-4">
                    Configure system settings and preferences.
                  </p>
                  <div className="space-y-4">
                    <div className="bg-gray-800 p-4 rounded-lg border border-gray-600">
                      <h3 className="text-lg font-semibold mb-2">
                        General Settings
                      </h3>
                      <p className="text-gray-400">
                        Configure general system settings
                      </p>
                    </div>
                    <div className="bg-gray-800 p-4 rounded-lg border border-gray-600">
                      <h3 className="text-lg font-semibold mb-2">
                        User Management
                      </h3>
                      <p className="text-gray-400">
                        Manage user accounts and permissions
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
