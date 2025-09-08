
import { ArrowLeft, Eye, EyeOff, Shield } from "lucide-react"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

// Using environment variable for port
const port = import.meta.env.VITE_DB_PORT || 5000

const AdminLogin = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    // Clear any existing session storage on component mount
    if (typeof window !== "undefined") {
      sessionStorage.clear()
    }
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault()
    setMessage("")
    setLoading(true)

    try {
      // Fetch all users from the API
      const response = await fetch(`http://localhost:${port}/users`)
      if (!response.ok) {
        throw new Error("Failed to fetch users from the server.")
      }

      const users = await response.json()

      // Find a user that matches the admin criteria and entered credentials
      const adminUser = users.find(
        (user) =>
          user.role === "admin" &&
          user.email === email &&
          user.password === password,
      )

      if (adminUser) {
        setMessage("✅ Login successful! Redirecting...")

        // Store admin user's data in session storage
        if (typeof window !== "undefined") {
          sessionStorage.setItem("adminName", JSON.stringify(adminUser))
        }

        // Redirect to the admin dashboard after a short delay
        setTimeout(() => {
          navigate("/admin")
        }, 1000)
      } else {
        setMessage("❌ Invalid admin credentials. Please try again...")
      }
    } catch (error) {
      console.error("Login error:", error)
      setMessage("❌ An error occurred during login. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-orange-50 flex items-center justify-center p-4">
      {/* Page Header */}
      <div className="absolute top-0 left-0 right-0 h-20 bg-white border-b-2 border-green-200 flex items-center px-6 shadow-sm">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-green-700 rounded-lg flex items-center justify-center mr-4 shadow-md">
            <span className="text-white font-bold text-lg">RMC</span>
          </div>
          <div>
            <h1 className="font-bold text-xl text-gray-800">
              Ranchi Municipal Corporation
            </h1>
            <p className="text-sm text-gray-600">
              Government of Jharkhand
            </p>
          </div>
        </div>
      </div>

      {/* Back to Home Button */}
      <button
        onClick={() => navigate("/")}
        className="absolute top-24 left-6 flex items-center text-green-700 hover:text-green-900 transition-colors font-medium"
      >
        <ArrowLeft className="mr-2" size={20} />
        <span>Back to Home</span>
      </button>

      {/* Login Card */}
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden mt-12 border border-green-100">
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white py-6 px-6">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-xl font-bold tracking-wide">ADMIN LOGIN</h2>
            </div>
          </div>
        </div>

        <div className="p-6">
          {message && (
            <div
              className={`mb-5 p-3 rounded-lg text-center text-sm border ${
                message.includes("✅")
                  ? "bg-green-50 text-green-700 border-green-200"
                  : "bg-red-50 text-red-700 border-red-200"
              }`}
            >
              {message}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Email Address
              </label>
              <input
                type="email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                placeholder="admin@ranchi.gov.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition pr-12"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-green-700 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-lg text-white font-medium transition ${
                loading
                  ? "bg-green-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-md hover:shadow-lg"
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
                  Logging in...
                </span>
              ) : (
                "Access Admin Dashboard"
              )}
            </button>
          </form>

          {/* Demo Credentials Hint */}
          <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
            <h3 className="text-sm font-semibold text-green-800 mb-2 flex items-center">
              <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
              Demo Admin Account:
            </h3>
            <div className="text-xs text-green-700 space-y-1">
              <p>
                <span className="font-medium">Email:</span> admin@ranchi.com
              </p>
              <p>
                <span className="font-medium">Password:</span> admin123
              </p>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-gray-500">
            <p>Secure access to government administration services</p>
            <p className="mt-1">
              © 2025 Government of Jharkhand. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminLogin