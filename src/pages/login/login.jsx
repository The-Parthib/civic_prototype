import { ArrowBigLeft, Eye, EyeOff, User, Shield } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// Use Vite env with a safe fallback so it works even if .env isn't loaded
const port = import.meta.env.VITE_DB_PORT || 5000;

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
      const response = await fetch(`http://localhost:${port}/users`);
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
          navigate("/p");
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-gray-100 flex items-center justify-center p-4">
      {/* Government Seal/Emblem Header */}
      <div className="absolute top-0 left-0 right-0 h-20 bg-white border-b border-orange-200 flex items-center justify-center px-6 shadow-sm">
        <div className="flex items-center">
          <div className="w-14 h-14 bg-orange-600 rounded-full flex items-center justify-center mr-4 shadow-md">
            <Shield className="text-white" size={32} />
          </div>
          <div className="text-center">
            <h1 className="font-bold text-2xl text-gray-800">Government of Jharkhand</h1>
            <p className="text-sm text-gray-600 mt-1">Official Citizen Portal</p>
          </div>
        </div>
      </div>

      <button
        onClick={() => navigate("/")}
        className="absolute top-24 left-6 flex items-center text-orange-700 hover:text-orange-900 transition-colors font-medium"
      >
        <ArrowBigLeft className="mr-1" size={20} />
        <span>Return to Home</span>
      </button>

      <div className="bg-white rounded-lg shadow-md w-full max-w-md overflow-hidden mt-24 border border-orange-100">
        {/* Login header */}
        <div className="bg-orange-600 text-white py-5 px-6 border-b-4 border-orange-700">
          <div className="flex items-center justify-center">
            <div className="bg-white p-2 rounded-full mr-3 shadow-sm">
              <User className="text-orange-600" size={22} />
            </div>
            <h2 className="text-xl font-semibold tracking-wide">CITIZEN LOGIN PORTAL</h2>
          </div>
          <p className="text-orange-100 text-xs text-center mt-2 tracking-wide">
            Secure access to government services
          </p>
        </div>

        <div className="p-6">
          {message && (
            <div
              className={`mb-5 p-3 rounded-md text-center text-sm border ${
                message.includes("✅")
                  ? "bg-green-50 text-green-700 border-green-200"
                  : "bg-yellow-50 text-amber-700 border-amber-200"
              }`}
            >
              {message}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Official Email Address
              </label>
              <input
                type="email"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                placeholder="Enter registered email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition pr-12"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-orange-700"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2.5 px-4 rounded-md text-white font-medium transition ${
                loading
                  ? "bg-orange-400 cursor-not-allowed"
                  : "bg-orange-600 hover:bg-orange-700 shadow-sm hover:shadow-md"
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                  Authenticating...
                </span>
              ) : (
                "Access Citizen Dashboard"
              )}
            </button>
          </form>

          <div className="text-center mt-6 text-sm text-gray-600">
            Not registered?{" "}
            <button
              onClick={() => navigate("/register/citizen")}
              className="text-orange-600 hover:text-orange-800 font-medium transition-colors duration-200"
            >
              Create citizen account
            </button>
          </div>

          <div className="mt-6 p-3 bg-amber-50 rounded-md border border-amber-200">
            <h3 className="text-sm font-semibold text-amber-800 mb-2 flex items-center">
              <Shield size={16} className="mr-1" />
              Demo Account Credentials:
            </h3>
            <div className="text-xs text-amber-700 space-y-1">
              <p>
                <span className="font-medium">Email:</span> john@example.com
              </p>
              <p>
                <span className="font-medium">Password:</span> demo123
              </p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex justify-center space-x-4">
              <button className="text-xs text-orange-600 hover:text-orange-800">
                Forgot Password?
              </button>
              <span className="text-gray-400">|</span>
              <button className="text-xs text-orange-600 hover:text-orange-800">
                Help & Support
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-gray-500">
            <p>Secure access to government services and grievance portal</p>
            <p className="mt-1">© 2025 Government of Jharkhand. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;