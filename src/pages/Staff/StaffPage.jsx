import   { useEffect, useState } from "react";
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
  BarChart3
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Department from "../../components/admin/departmentAdmin/Department";
import MapView from "../../components/admin/mapAdmin/Map";
import DashboardStaff from "../../components/staff/staffDashboard/DashboardStaff";
import axios from "axios";
import StaffDepartment from "../../components/staff/staffDepartment/StaffDepartment";

const port = import.meta.env.VITE_DB_PORT;
const StaffPage = () => {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [responsibility, setResponsibility] = useState("")
  const [staffId, setStaffId] = useState()
  const [name, setName] = useState("");
  const [municipality, setMunicipality] = useState("");
  const [department, setDepartment] = useState("");
  const [allocatedComplaints, setAllocatedComplaints] = useState([]);
  const [complaints, setComplaints] = useState({});
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let staff = sessionStorage.getItem("staffName");
    const staffData = JSON.parse(staff);
    // console.log(staffData.id)

    if(staffData == null){
      navigate("/staff/login")
    }
    else{
      setMunicipality(staffData.municipality);
      setDepartment(staffData.departmentName)
      setName(staffData.name)
      setResponsibility(staffData.responsibility)
      setStaffId(staffData.id)

      const fetchAllocatedDepartment = async () => {
        try {
          const allocation = await axios.get(`http://localhost:${port}/allocatedDepartment?staffId=${staffId}`);
          const complaints = await axios.get(`http://localhost:${port}/complaints?assignedTo=${staffId}`);
          // console.log("kughv",allocation.data);
          setAllocatedComplaints(allocation.data);
          setComplaints(complaints.data)
        } catch (error) {
          console.error(error);
        }
      };
      fetchAllocatedDepartment();
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

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 flex">
      {/* Top header */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-blue-800 text-white flex items-center px-4 z-10 shadow-md">
        <div className="flex items-center">
          <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mr-3">
            <div className="w-12 h-12 bg-blue-800 rounded-full flex items-center justify-center text-white font-semibold">RMC</div>
          </div>
          <div>
            <h1 className="font-bold text-lg">{municipality}</h1>
            <p className="text-xs text-blue-200">Government of Jharkhand</p>
          </div>
        </div>
        
        <div className="flex-1 flex justify-center">
          <div className="bg-blue-700 rounded-lg px-4 py-1 text-lg font-semibold text-white">
            {department}
          </div>
        </div>
        
        <div className="flex items-center">
          <div className="mr-4 flex items-center bg-blue-700 rounded-full pl-1 pr-3 py-1">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-2">
              <User size={16} />
            </div>
            <span className="text-sm">{name}</span>
          </div>
          <button
            onClick={() => navigate("/staff/login")}
            className="bg-blue-700 hover:bg-blue-600 p-2 rounded-full"
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <div 
        className={`fixed top-16 bottom-0 bg-white pt-6 min-h-screen transition-all duration-300 shadow-lg z-10 ${
          sidebarCollapsed ? "w-16" : "w-56"
        }`}
      >
        <button 
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute -right-3 top-5 bg-blue-800 text-white p-1 rounded-full"
        >
          {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>

        <nav className="px-2">
          {menuItems.map((item) => (
            <button
              key={item.name}
              onClick={() => setActiveTab(item.name)}
              className={`w-full text-left px-4 py-3 text-sm rounded-md mb-1 flex items-center transition-discrete duration-100 ${
                activeTab === item.name
                  ? "bg-blue-100 text-blue-800 border-l-4 border-blue-800 font-semibold"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <span className="mr-3 text-blue-700">{item.icon}</span>
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

      {/* Main content area */}
      <div className={`flex-1 pt-16 transition-all duration-300 ${sidebarCollapsed ? "ml-16" : "ml-56"}`}>
        <div className="p-6">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm min-h-screen">
            <div className="px-6 py-5 border-b border-gray-200">
              <h1 className="text-2xl font-bold text-gray-800">
                {activeTab === "Dashboard" ? `Welcome, ${name}` : activeTab}
              </h1>
              {activeTab === "Dashboard" && (
                <p className="text-gray-500 mt-1 font-semibold">
                Responsibility :  {responsibility} 
                </p>
              )}
            </div>

            <div className="p-6">
              {activeTab === "Dashboard" && <DashboardStaff complaints={complaints} allocation={allocatedComplaints} />}

              {activeTab === "Department" && <StaffDepartment/>}

              {activeTab === "Map" &&  "Comming Soon..." }

              {activeTab === "Updates" && (
                <div>
                  <p className="text-gray-600 mb-4">
                    Manage system updates and maintenance schedules.
                  </p>
                  <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold mb-2 text-blue-800">
                        System Updates
                      </h3>
                      <p className="text-blue-700">No pending updates</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "Announcements" && (
                <div>
                  <p className="text-gray-600 mb-4">
                    Create and manage public announcements.
                  </p>
                  <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2 text-blue-800">
                      Recent Announcements
                    </h3>
                    <p className="text-blue-700">No recent announcements</p>
                  </div>
                </div>
              )}

              {activeTab === "Settings" && (
                <div>
                  <p className="text-gray-600 mb-4">
                    Configure system settings and preferences.
                  </p>
                  <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold mb-2 text-blue-800">
                        General Settings
                      </h3>
                      <p className="text-blue-700">
                        Configure general system settings
                      </p>
                    </div>
                    <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold mb-2 text-blue-800">
                        User Management
                      </h3>
                      <p className="text-blue-700">
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