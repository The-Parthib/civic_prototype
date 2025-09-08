import { ArrowBigLeft, Eye, EyeOff, User, Shield } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// Use Vite env with a safe fallback so it works even if .env isn't loaded
const port = import.meta.env.VITE_DB_PORT || 5000;
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    sessionStorage.clear();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(`${apiBaseUrl}:${port}/users`);
      if (!response.ok) throw new Error("Failed to fetch users");

      const users = await response.json();

      const civicUser = users.find(
        (user) =>
          user.role === "citizen" &&
          user.email === email &&
          user.password === password
      );

      if (civicUser) {
        setMessage("✅ Login successful! Redirecting...");
        sessionStorage.setItem("civicName", JSON.stringify(civicUser));

        setTimeout(() => {
          navigate("/home");
        }, 1000);
      } else {
        setMessage("❌ Invalid email or password. Please try again.");
      }
    } catch (err) {
      console.error("Citizen login error:", err);
      setMessage("❌ Unable to connect to server. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-gray-100">
      {/* Cross-platform Header */}
      <div className="bg-white shadow-sm border-b border-orange-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-3 sm:py-4 flex items-center justify-between">
            <button
              onClick={() => navigate("/")}
              className="flex items-center text-orange-700 hover:text-orange-900 transition-colors p-2 -ml-2 rounded-lg hover:bg-orange-50 active:bg-orange-100"
              aria-label="Go back to home"
            >
              <ArrowBigLeft size={20} className="sm:mr-1" />
              <span className="hidden sm:inline ml-1 text-sm font-medium">Back to Home</span>
              <span className="sm:hidden ml-1 text-sm font-medium">Back</span>
            </button>
            
            <div className="flex items-center">
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-orange-600 rounded-full flex items-center justify-center mr-2 sm:mr-3 shadow-md">
                <Shield className="text-white" size={16} />
              </div>
              <div className="text-center">
                <h1 className="font-bold text-sm sm:text-lg lg:text-xl text-gray-800">
                  <span className="hidden sm:inline">Government of Jharkhand</span>
                  <span className="sm:hidden">Gov. Jharkhand</span>
                </h1>
                <p className="hidden sm:block text-xs lg:text-sm text-gray-600 mt-1">
                  Official Citizen Portal
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="flex items-center justify-center px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {/* Login Card - Responsive Width */}
        <div className="bg-white rounded-2xl shadow-lg lg:shadow-xl overflow-hidden border border-orange-100 w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-orange-600 to-orange-700 px-6 sm:px-8 lg:px-10 py-6 sm:py-8 lg:py-10 text-center">
            <div className="bg-white p-3 lg:p-4 rounded-full inline-flex mb-4 lg:mb-6 shadow-sm">
              <User className="text-orange-600" size={24} />
            </div>
            <h2 className="text-white text-xl sm:text-2xl lg:text-3xl font-bold mb-2">
              Citizen Login Portal
            </h2>
            <p className="text-orange-100 text-sm sm:text-base lg:text-lg">
              Secure access to government services
            </p>
          </div>

          {/* Form Section */}
          <div className="p-6 sm:p-8 lg:p-10">
            {message && (
              <div
                className={`mb-6 p-4 lg:p-5 rounded-xl text-center text-sm sm:text-base font-medium ${
                  message.includes("✅")
                    ? "bg-green-50 text-green-800 border border-green-200"
                    : "bg-red-50 text-red-800 border border-red-200"
                }`}
              >
                {message}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6 lg:space-y-8">
              {/* Email Input */}
              <div>
                <label className="block text-sm sm:text-base lg:text-lg font-semibold text-gray-700 mb-2 lg:mb-3">
                  Official Email Address
                </label>
                <input
                  type="email"
                  className="w-full px-4 lg:px-5 py-3 sm:py-4 lg:py-5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-0 transition-colors text-base lg:text-lg bg-gray-50 focus:bg-white"
                  placeholder="Enter your registered email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-sm sm:text-base lg:text-lg font-semibold text-gray-700 mb-2 lg:mb-3">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="w-full px-4 lg:px-5 py-3 sm:py-4 lg:py-5 pr-12 lg:pr-14 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-0 transition-colors text-base lg:text-lg bg-gray-50 focus:bg-white"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-4 lg:right-5 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-orange-600 p-1 lg:p-2 rounded-md hover:bg-gray-100 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 sm:py-4 lg:py-5 px-6 lg:px-8 rounded-xl text-white font-semibold text-base lg:text-lg transition-all duration-200 ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 active:scale-95 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 lg:h-6 lg:w-6 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span className="hidden sm:inline">Authenticating...</span>
                    <span className="sm:hidden">Signing In...</span>
                  </span>
                ) : (
                  <>
                    <span className="hidden sm:inline">Access Citizen Dashboard</span>
                    <span className="sm:hidden">Sign In</span>
                  </>
                )}
              </button>
            </form>

            {/* Register Link */}
            <div className="text-center mt-6 lg:mt-8">
              <p className="text-gray-600 text-sm sm:text-base lg:text-lg mb-3 lg:mb-4">
                Don't have an account?
              </p>
              <button
                onClick={() => navigate("/register/citizen")}
                className="text-orange-600 hover:text-orange-800 font-semibold text-base lg:text-lg transition-colors py-2 lg:py-3 px-4 lg:px-6 rounded-lg hover:bg-orange-50 active:bg-orange-100"
              >
                Create Citizen Account
              </button>
            </div>

            {/* Demo Credentials */}
            <div className="mt-6 lg:mt-8 p-4 lg:p-6 bg-amber-50 rounded-xl border border-amber-200">
              <div className="flex items-center mb-3 lg:mb-4">
                <Shield size={16} className="text-amber-600 mr-2" />
                <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-amber-800">
                  Demo Account Credentials
                </h3>
              </div>
              <div className="space-y-2 lg:space-y-3 text-xs sm:text-sm lg:text-base text-amber-700">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-1 lg:py-2">
                  <span className="font-medium mb-1 sm:mb-0">Email:</span>
                  <span className="bg-white px-2 lg:px-3 py-1 lg:py-2 rounded font-mono text-xs sm:text-sm">
                    john@example.com
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-1 lg:py-2">
                  <span className="font-medium mb-1 sm:mb-0">Password:</span>
                  <span className="bg-white px-2 lg:px-3 py-1 lg:py-2 rounded font-mono text-xs sm:text-sm">
                    demo123
                  </span>
                </div>
              </div>
            </div>

            {/* Footer Links */}
            <div className="mt-6 lg:mt-8 pt-6 lg:pt-8 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-6 lg:space-x-8">
                <button className="text-sm sm:text-base lg:text-lg text-orange-600 hover:text-orange-800 font-medium py-2 lg:py-3 px-3 lg:px-4 rounded-lg hover:bg-orange-50 transition-colors">
                  Forgot Password?
                </button>
                <button className="text-sm sm:text-base lg:text-lg text-orange-600 hover:text-orange-800 font-medium py-2 lg:py-3 px-3 lg:px-4 rounded-lg hover:bg-orange-50 transition-colors">
                  Help & Support
                </button>
              </div>
            </div>

            {/* Copyright */}
            <div className="mt-6 lg:mt-8 text-center">
              <p className="text-xs sm:text-sm lg:text-base text-gray-500 leading-relaxed">
                Secure access to government services and grievance portal
              </p>
              <p className="text-xs sm:text-sm text-gray-400 mt-2 lg:mt-3">
                © 2025 Government of Jharkhand. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;