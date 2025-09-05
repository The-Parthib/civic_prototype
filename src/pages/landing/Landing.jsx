import React from "react";
import { useNavigate } from "react-router-dom";

const Landing = () => {
    let navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center mr-3">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Civic Portal</h1>
            </div>
            <div className="flex space-x-4">
              <button onClick={()=> navigate("/login")}  className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors">
                Login
              </button>
              <button onClick={()=> navigate("/register/citizen")}  className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded text-sm font-medium transition-colors">
                Register
              </button>
              <button onClick={()=> navigate("/admin/login")}  className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded text-sm font-medium transition-colors">
                Admin
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-12">
            <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-8">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h6m-6 4h6m-6 4h6" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-6">
              Welcome to Civic Portal
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Your gateway to digital government services. Access essential civic services, 
              connect with local government, and participate in your community.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Digital Services</h3>
              <p className="text-gray-600 text-sm">
                Access government forms, applications, and documentation online
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Community</h3>
              <p className="text-gray-600 text-sm">
                Connect with local representatives and community initiatives
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2-2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Information</h3>
              <p className="text-gray-600 text-sm">
                Stay informed with official announcements and public records
              </p>
            </div>
          </div>

          <div className="bg-blue-50 p-8 rounded-lg border border-blue-100">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Get Started Today
            </h2>
            <p className="text-gray-700 mb-6">
              Create your account to access personalized government services and stay connected with your local community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-blue-600 text-white hover:bg-blue-700 px-6 py-3 rounded font-medium transition-colors">
                Create Account
              </button>
              <button className="border border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-3 rounded font-medium transition-colors">
                Sign In
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center mb-4">
                <div className="w-6 h-6 bg-white rounded flex items-center justify-center mr-2">
                  <span className="text-gray-800 font-bold text-xs">C</span>
                </div>
                <span className="font-semibold">Civic Portal</span>
              </div>
              <p className="text-gray-300 text-sm mb-4">
                Connecting citizens with government services through secure, accessible digital platforms.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Services</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>Digital Forms</li>
                <li>Public Records</li>
                <li>Permits & Licenses</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Support</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>Accessibility</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-6 text-center">
            <p className="text-gray-400 text-sm">
              © 2025 Civic Portal. Official government services platform.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;