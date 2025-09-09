import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Settings,
  LogOut,
  Bell,
  Shield,
  HelpCircle,
  Edit3,
  Camera,
} from "lucide-react";
import BottomNavigation from "../../components/BottomNavigation";

const ProfileScreen = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalReports: 0,
    resolvedReports: 0,
    pendingReports: 0,
  });
  const [loading, setLoading] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    const storedUser = sessionStorage.getItem("civicName");
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      fetchUserStats(userData.email);
    } else {
      navigate("/login");
    }

    // Check notification permission
    const notifEnabled =
      localStorage.getItem("notificationsEnabled") === "true";
    setNotificationsEnabled(notifEnabled);
  }, [navigate]);

  const fetchUserStats = async (email) => {
    try {
      const response = await fetch(
        `https://jansamadhan-json-server.onrender.com/complaints?userInfo.email=${encodeURIComponent(
          email
        )}`
      );
      if (response.ok) {
        const complaints = await response.json();
        const totalReports = complaints.length;
        const resolvedReports = complaints.filter(
          (c) => c.status === "Resolved"
        ).length;
        const pendingReports = complaints.filter(
          (c) => c.status !== "Resolved"
        ).length;

        setStats({ totalReports, resolvedReports, pendingReports });
      }
    } catch (error) {
      console.error("Error fetching user stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("civicName");
    navigate("/login");
  };

  const toggleNotifications = async () => {
    if ("Notification" in window) {
      if (notificationsEnabled) {
        localStorage.setItem("notificationsEnabled", "false");
        setNotificationsEnabled(false);
      } else {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          localStorage.setItem("notificationsEnabled", "true");
          setNotificationsEnabled(true);
        }
      }
    }
  };

  const StatCard = ({ title, value, color = "blue" }) => (
    <div
      className={`bg-${color}-50 border border-${color}-200 rounded-lg p-4 text-center`}
    >
      <div className={`text-2xl font-bold text-${color}-600`}>{value}</div>
      <div className={`text-sm text-${color}-700 mt-1`}>{title}</div>
    </div>
  );

  const MenuItem = ({ icon: Icon, title, subtitle, onClick, rightElement }) => (
    <button
      onClick={onClick}
      className="w-full flex items-center space-x-3 p-4 bg-white rounded-lg border hover:bg-gray-50 transition-colors"
    >
      <div className="p-2 bg-gray-100 rounded-lg">
        <Icon size={20} className="text-gray-600" />
      </div>
      <div className="flex-1 text-left">
        <h3 className="font-medium text-gray-900">{title}</h3>
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
      </div>
      {rightElement}
    </button>
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
          <h1 className="text-xl font-bold text-gray-900">Profile</h1>
        </div>
      </header>

      <main className="px-4 py-6 space-y-6">
        {/* Profile Card */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                <User size={32} className="text-blue-600" />
              </div>
              <button className="absolute -bottom-1 -right-1 p-1 bg-blue-600 text-white rounded-full">
                <Camera size={12} />
              </button>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900">
                {user?.name || "User"}
              </h2>
              <p className="text-gray-600">{user?.email}</p>
              <div className="flex items-center space-x-1 text-sm text-gray-500 mt-1">
                <MapPin size={14} />
                <span>
                  {user?.municipality}, {user?.district}
                </span>
              </div>
            </div>
            <button className="p-2 text-gray-400 hover:text-gray-600">
              <Edit3 size={16} />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <StatCard
            title="Total Reports"
            value={stats.totalReports}
            color="blue"
          />
          <StatCard
            title="Resolved"
            value={stats.resolvedReports}
            color="green"
          />
          <StatCard
            title="Pending"
            value={stats.pendingReports}
            color="yellow"
          />
        </div>

        {/* Personal Information */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Personal Information
          </h3>

          <MenuItem
            icon={Mail}
            title="Email"
            subtitle={user?.email || "Not provided"}
            onClick={() => {}}
          />

          <MenuItem
            icon={Phone}
            title="Phone Number"
            subtitle={user?.phone || "Not provided"}
            onClick={() => {}}
          />

          <MenuItem
            icon={MapPin}
            title="Location"
            subtitle={`${user?.municipality}, ${user?.district}, ${user?.state}`}
            onClick={() => {}}
          />
        </div>

        {/* Settings */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">Settings</h3>

          <MenuItem
            icon={Bell}
            title="Notifications"
            subtitle={notificationsEnabled ? "Enabled" : "Disabled"}
            onClick={toggleNotifications}
            rightElement={
              <div
                className={`w-12 h-6 rounded-full ${
                  notificationsEnabled ? "bg-blue-600" : "bg-gray-300"
                } relative transition-colors`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                    notificationsEnabled ? "translate-x-6" : "translate-x-0.5"
                  }`}
                />
              </div>
            }
          />

          <MenuItem
            icon={Shield}
            title="Privacy & Security"
            subtitle="Manage your privacy settings"
            onClick={() => {}}
          />

          <MenuItem
            icon={Settings}
            title="App Settings"
            subtitle="Language, theme, and more"
            onClick={() => {}}
          />
        </div>

        {/* Support */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">Support</h3>

          <MenuItem
            icon={HelpCircle}
            title="Help & Support"
            subtitle="Get help and contact support"
            onClick={() => {}}
          />

          <MenuItem
            icon={LogOut}
            title="Logout"
            subtitle="Sign out of your account"
            onClick={handleLogout}
          />
        </div>

        {/* App Info */}
        <div className="bg-gray-100 rounded-lg p-4 text-center">
          <p className="text-sm text-gray-600">Civic Issue Tracker</p>
          <p className="text-xs text-gray-500 mt-1">Version 1.0.0</p>
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default ProfileScreen;
