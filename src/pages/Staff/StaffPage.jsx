import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  LogOut,
  Building,
  Map,
  Bell,
  Megaphone,
  Settings,
  User,
  BarChart3,
  Menu,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import DashboardStaff from "../../components/staff/staffDashboard/DashboardStaff";
import axios from "axios";
import StaffDepartment from "../../components/staff/staffDepartment/StaffDepartment";

const StaffPage = () => {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [responsibility, setResponsibility] = useState("");
  const [staffId, setStaffId] = useState();
  const [name, setName] = useState("");
  const [municipality, setMunicipality] = useState("");
  const [department, setDepartment] = useState("");
  const [allocatedComplaints, setAllocatedComplaints] = useState([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const fetchAllocatedDepartment = async (id) => {
    try {
      const allocation = await axios.get(
        `https://jansamadhan-json-server.onrender.com/allocatedDepartment?assignedTo=${id}`
      );

      setAllocatedComplaints(allocation.data);
      console.log("hehe", allocatedComplaints);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    let staff = sessionStorage.getItem("staffName");
    const staffData = JSON.parse(staff);

    if (staffData == null) {
      navigate("/staff/login");
    } else {
      setMunicipality(staffData.municipality);
      setDepartment(staffData.departmentName);
      setName(staffData.name);
      setResponsibility(staffData.responsibility);
      setStaffId(staffData.id);

      // Call the optimized function with the staff ID
      if (staffData.id) {
        fetchAllocatedDepartment(staffData.id);
      }
    }
  }, [staffId]);

  const menuItems = [
    { name: "Dashboard", icon: <BarChart3 size={18} /> },
    { name: "Department", icon: <Building size={18} /> },
    { name: "Map", icon: <Map size={18} /> },
    { name: "Updates", icon: <Bell size={18} /> },
    { name: "Announcements", icon: <Megaphone size={18} /> },
    { name: "Settings", icon: <Settings size={18} /> },
  ];

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    // Close mobile sidebar when a tab is selected
    if (window.innerWidth < 768) {
      setMobileSidebarOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-green-50 text-gray-800 flex">
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        className="md:hidden fixed top-4 left-4 z-30 bg-green-700 text-white p-2 rounded-lg"
      >
        {mobileSidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Top header */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-green-800 text-white flex items-center px-4 z-20 shadow-md">
        <div className="flex items-center md:ml-0 ml-10">
          <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mr-3">
            <div className="w-12 h-12 bg-green-800 rounded-full flex items-center justify-center text-white font-semibold">
              RMC
            </div>
          </div>
          <div>
            <h1 className="font-bold text-lg">{municipality}</h1>
            <p className="text-xs text-green-200">Government of Jharkhand</p>
          </div>
        </div>

        <div className="flex-1 flex justify-center">
          <div className="bg-green-700 rounded-lg px-4 py-1 text-lg font-semibold text-white hidden md:block">
            {department}
          </div>
        </div>

        <div className="flex items-center">
          <div className="mr-4 flex items-center bg-green-700 rounded-full pl-1 pr-3 py-1">
            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center mr-2">
              <User size={16} />
            </div>
            <span className="text-sm hidden sm:inline">{name}</span>
          </div>
          <button
            onClick={() => navigate("/staff/login")}
            className="bg-green-700 hover:bg-green-600 p-2 rounded-full"
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {/* Sidebar for desktop */}
      <div
        className={`hidden md:block fixed top-16 bottom-0 bg-white pt-6 min-h-screen transition-all duration-300 shadow-lg z-10 ${
          sidebarCollapsed ? "w-16" : "w-56"
        }`}
      >
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute -right-3 top-5 bg-green-800 text-white p-1 rounded-full"
        >
          {sidebarCollapsed ? (
            <ChevronRight size={16} />
          ) : (
            <ChevronLeft size={16} />
          )}
        </button>

        <nav className="px-2">
          {menuItems.map((item) => (
            <button
              key={item.name}
              onClick={() => handleTabChange(item.name)}
              className={`w-full text-left px-4 py-3 text-sm rounded-md mb-1 flex items-center transition-discrete duration-100 ${
                activeTab === item.name
                  ? "bg-green-100 text-green-800 border-l-4 border-green-800 font-semibold"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <span className="mr-3 text-green-700">{item.icon}</span>
              {!sidebarCollapsed && item.name}
            </button>
          ))}
        </nav>

        {!sidebarCollapsed && (
          <div className="mt-6 px-4 border-t pt-4 text-xs text-gray-500">
            <p>© 2025 Jharkhand Government</p>
            <p className="mt-1">Admin Portal v1.0</p>
          </div>
        )}
      </div>

      {/* Mobile sidebar */}
      <div
        className={`md:hidden fixed inset-0 z-30 bg-transparent backdrop-blur-md transition-opacity duration-300 ${
          mobileSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMobileSidebarOpen(false)}
      >
        <div
          className={`fixed top-0 left-0 bottom-0 w-64 bg-white pt-16 transform transition-transform duration-300 ${
            mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <nav className="px-2 py-4">
            {menuItems.map((item) => (
              <button
                key={item.name}
                onClick={() => handleTabChange(item.name)}
                className={`w-full text-left px-4 py-3 text-sm rounded-md mb-1 flex items-center ${
                  activeTab === item.name
                    ? "bg-green-100 text-green-800 border-l-4 border-green-800 font-semibold"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <span className="mr-3 text-green-700">{item.icon}</span>
                {item.name}
              </button>
            ))}
          </nav>

          <div className="absolute bottom-0 left-0 right-0 px-4 py-4 border-t text-xs text-gray-500">
            <p>© 2025 Jharkhand Government</p>
            <p className="mt-1">Admin Portal v1.0</p>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div
        className={`flex-1 pt-16 transition-all duration-300 ${
          sidebarCollapsed ? "md:ml-16" : "md:ml-56"
        }`}
      >
        <div className="p-4 md:p-6">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm min-h-screen">
            <div className="px-4 md:px-6 py-5 border-b border-gray-200">
              <h1 className="text-xl md:text-2xl font-bold text-gray-800">
                {activeTab === "Dashboard" ? `Welcome, ${name}` : activeTab}
              </h1>
              {activeTab === "Dashboard" && (
                <p className="text-gray-500 mt-1 font-semibold">
                  Responsibility : {responsibility}
                </p>
              )}
            </div>

            <div className="p-4 md:p-6">
              {activeTab === "Dashboard" && (
                <DashboardStaff allocation={allocatedComplaints} />
              )}

              {activeTab === "Department" && <StaffDepartment />}

              {activeTab === "Map" && (
                <div className="text-center py-10 text-gray-500">
                  Map view coming soon...
                </div>
              )}

              {activeTab === "Updates" && (
                <div>
                  <p className="text-gray-600 mb-4">
                    Manage system updates and maintenance schedules.
                  </p>
                  <div className="space-y-4">
                    <div className="bg-green-50 border border-green-100 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold mb-2 text-green-800">
                        System Updates
                      </h3>
                      <p className="text-green-700">No pending updates</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "Announcements" && (
                <div>
                  <p className="text-gray-600 mb-4">
                    Create and manage public announcements.
                  </p>
                  <div className="bg-green-50 border border-green-100 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2 text-green-800">
                      Recent Announcements
                    </h3>
                    <p className="text-green-700">No recent announcements</p>
                  </div>
                </div>
              )}

              {activeTab === "Settings" && (
                <div>
                  <p className="text-gray-600 mb-4">
                    Configure system settings and preferences.
                  </p>
                  <div className="space-y-4">
                    <div className="bg-green-50 border border-green-100 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold mb-2 text-green-800">
                        General Settings
                      </h3>
                      <p className="text-green-700">
                        Configure general system settings
                      </p>
                    </div>
                    <div className="bg-green-50 border border-green-100 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold mb-2 text-green-800">
                        User Management
                      </h3>
                      <p className="text-green-700">
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

export default StaffPage;
