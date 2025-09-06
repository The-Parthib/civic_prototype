import { ArrowBigLeft, Shield, Eye, EyeOff } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const port = import.meta.env.VITE_DB_PORT;

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    sessionStorage.clear();
  }, [])
  

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      const response = await fetch(`http://localhost:${port}/users`);
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const users = await response.json();

      const adminUser = users.find(
        (user) =>
          user.role === 'admin' &&
          user.email === email &&
          user.password === password
      );

      if (adminUser) {
        setMessage('✅ Login successful! Redirecting...');
        let a = JSON.stringify(adminUser)
        console.log(a);
        console.log(JSON.parse(a));
        sessionStorage.setItem("adminName",JSON.stringify(adminUser));
        
        // Wait a moment to show success message before redirecting
        setTimeout(() => {
          navigate("/admin");
        }, 1000);
        
      } else {
        setMessage('❌ Invalid admin credentials. Please try again...');
      }
    } catch (error) {
      console.error('Login error:', error);
      setMessage('❌ An error occurred during login. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
      {/* Header with branding */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-blue-800 text-white flex items-center px-6 shadow-md">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mr-3">
            <div className="w-8 h-8 bg-blue-800 rounded-full flex items-center justify-center text-white font-bold">JG</div>
          </div>
          <div>
            <h1 className="font-bold text-lg">Jharkhand Government</h1>
            <p className="text-xs text-blue-200">Administration Portal</p>
          </div>
        </div>
      </div>

      <button 
        onClick={() => navigate("/")}
        className="absolute top-24 left-6 flex items-center text-blue-800 hover:text-blue-600 transition-colors"
      >
        <ArrowBigLeft className="mr-1" size={20} />
        <span>Back to Home</span>
      </button>

      <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden mt-12">
        {/* Login Header */}
        <div className="bg-blue-800 text-white py-5 px-6">
          <div className="flex items-center justify-center">
            <div className="bg-blue-700 p-3 rounded-full mr-3">
              <Shield size={24} />
            </div>
            <h2 className="text-2xl font-bold">Admin Login</h2>
          </div>
          <p className="text-blue-200 text-sm text-center mt-2">
            Access government administration dashboard
          </p>
        </div>

        <div className="p-6">
          {message && (
            <div
              className={`mb-5 p-3 rounded-lg text-center text-sm ${
                message.includes('✅') 
                  ? 'bg-green-100 text-green-700 border border-green-200' 
                  : 'bg-red-100 text-red-700 border border-red-200'
              }`}
            >
              {message}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="admin@ranchi.gov.in"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition pr-12"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-700"
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
                  ? 'bg-blue-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Logging in...
                </span>
              ) : 'Login to Dashboard'}
            </button>
          </form>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
            <h3 className="text-sm font-semibold text-blue-800 mb-2">Demo Admin Account:</h3>
            <div className="text-xs text-blue-700 space-y-1">
              <p><span className="font-medium">Email:</span> admin@ranchi.com</p>
              <p><span className="font-medium">Password:</span> admin123</p>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-gray-500">
            <p>Secure access to government administration services</p>
            <p className="mt-1">© 2025 Jharkhand Government</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;