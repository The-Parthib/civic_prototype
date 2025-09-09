import { useState } from 'react';
import { TrendingUp, Users, Clock, CheckCircle, AlertTriangle, BarChart3, Merge } from 'lucide-react';
import ComplaintsView from '../complaintsView/ComplaintsView';
import UnifiedComplaintsView from '../unifiedComplaints/UnifiedComplaintsView';

const DashboardOverview = ({ allocatedComplaints = [], complaints = [] }) => {
  const [activeView, setActiveView] = useState("overview"); // "overview", "complaints", or "unified"

  // Calculate statistics
  const totalComplaints = complaints.length;
  const processedComplaints = allocatedComplaints.length;
  
  // Fix status calculation - using actual status values from database
  const submittedComplaints = complaints.filter(c => c.status === 'Submitted').length;
  const inProgressComplaints = complaints.filter(c => c.status === 'In Progress').length;
  const rejectedComplaints = complaints.filter(c => c.status === 'Rejected').length;
  
  // Also get stats from allocated complaints
  const allocatedSubmitted = allocatedComplaints.filter(c => c.status === 'Submitted' || !c.status).length;
  const allocatedInProgress = allocatedComplaints.filter(c => c.status === 'In Progress').length;
  const allocatedRejected = allocatedComplaints.filter(c => c.status === 'Rejected').length;

  // Department wise breakdown - combining both data sources
  const departmentStats = {};
  
  // Add from allocatedComplaints (AI-processed)
  allocatedComplaints.forEach(complaint => {
    const dept = complaint.department || 'Unknown';
    if (!departmentStats[dept]) {
      departmentStats[dept] = { allocated: 0, regular: 0, total: 0 };
    }
    departmentStats[dept].allocated += 1;
    departmentStats[dept].total += 1;
  });
  
  // Add from regular complaints
  complaints.forEach(complaint => {
    const dept = complaint.department || 'Unknown';
    if (!departmentStats[dept]) {
      departmentStats[dept] = { allocated: 0, regular: 0, total: 0 };
    }
    departmentStats[dept].regular += 1;
    departmentStats[dept].total += 1;
  });

  const StatCard = ({ title, value, icon: Icon, color = "blue", subtitle }) => (
    <div className={`bg-white p-6 rounded-lg shadow-sm border border-${color}-100`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-${color}-600 text-sm font-medium`}>{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 bg-${color}-100 rounded-full`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  );

  if (activeView === "complaints") {
    return (
      <div>
        <div className="mb-6">
          <button
            onClick={() => setActiveView("overview")}
            className="flex items-center px-4 py-2 text-blue-600 hover:text-blue-800 transition-colors"
          >
            ← Back to Overview
          </button>
        </div>
        <ComplaintsView allocatedComplaints={allocatedComplaints} complaints={complaints} />
      </div>
    );
  }

  if (activeView === "unified") {
    return (
      <div>
        <div className="mb-6">
          <button
            onClick={() => setActiveView("overview")}
            className="flex items-center px-4 py-2 text-blue-600 hover:text-blue-800 transition-colors"
          >
            ← Back to Overview
          </button>
        </div>
        <UnifiedComplaintsView allocatedComplaints={allocatedComplaints} complaints={complaints} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
        <p className="text-blue-800">
          Welcome to the Jharkhand Government Admin Dashboard. Manage your
          government services and applications here.
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Complaints"
          value={totalComplaints}
          icon={BarChart3}
          color="blue"
          subtitle="All complaints (regular + AI processed)"
        />
        {/* <StatCard
          title="AI Processed"
          value={processedComplaints}
          icon={TrendingUp}
          color="indigo"
          subtitle="Enhanced with AI analysis"
        />
        <StatCard
          title="Submitted"
          value={submittedComplaints + allocatedSubmitted}
          icon={Clock}
          color="orange"
          subtitle="Awaiting action"
        /> */}
        <StatCard
          title="In Progress"
          value={inProgressComplaints + allocatedInProgress}
          icon={AlertTriangle}
          color="blue"
          subtitle="Currently being handled"
        />
      </div>

      {/* Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Status Distribution</h3>
          <div className="space-y-3">
            {/* <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-orange-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600">Submitted</span>
              </div>
              <span className="font-semibold text-gray-800">{submittedComplaints + allocatedSubmitted}</span>
            </div> */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600">In Progress</span>
              </div>
              <span className="font-semibold text-gray-800">{inProgressComplaints + allocatedInProgress}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600">Rejected</span>
              </div>
              <span className="font-semibold text-gray-800">{rejectedComplaints + allocatedRejected}</span>
            </div>
          </div>
        </div>

        {/* Department Breakdown */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Department Allocation</h3>
          <div className="space-y-3 max-h-48 overflow-y-auto">
            {Object.entries(departmentStats).map(([dept, stats]) => (
              <div key={dept} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 truncate">{dept}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">
                    AI: {stats.allocated} | Regular: {stats.regular}
                  </span>
                  <span className="font-semibold text-gray-800">{stats.total}</span>
                </div>
              </div>
            ))}
            {Object.keys(departmentStats).length === 0 && (
              <p className="text-gray-500 text-sm">No departments allocated yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setActiveView("unified")}
            className="flex items-center p-4 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-200"
          >
            <Merge className="h-5 w-5 text-indigo-600 mr-3" />
            <div className="text-left">
              <p className="font-medium text-indigo-800">Unified View</p>
              <p className="text-xs text-indigo-600">Complete merged data</p>
            </div>
          </button>
          
          <button
            onClick={() => setActiveView("complaints")}
            className="flex items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
          >
            <Users className="h-5 w-5 text-blue-600 mr-3" />
            <div className="text-left">
              <p className="font-medium text-blue-800">Separate Views</p>
              <p className="text-xs text-blue-600">Toggle between datasets</p>
            </div>
          </button>
          
          <button className="flex items-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors border border-green-200">
            <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
            <div className="text-left">
              <p className="font-medium text-green-800">Mark as Resolved</p>
              <p className="text-xs text-green-600">Update complaint status</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
