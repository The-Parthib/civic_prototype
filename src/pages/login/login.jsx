import { ArrowBigLeft } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    sessionStorage.clear();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:3000/users");
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const users = await response.json();

      const civicUser = users.find(
        (user) =>
          user.role === "citizen" &&
          user.email === email &&
          user.password === password
      );

      if (civicUser) {
        setMessage("✅ Login successful!");
        console.log({ civicUser });
        sessionStorage.setItem("civicName", civicUser.name);
        navigate("/p");

        // You can redirect or store session here
      } else {
        setMessage("❌ Invalid admin credentials.");
      }
    } catch (error) {
      console.error("Login error:", error);
      setMessage("❌ An error occurred during login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen relative">
      <button
        onClick={() => navigate("/")}
        className="absolute top-6 left-6 bg-white rounded-full shadow p-2 hover:bg-gray-100 transition"
      >
        <ArrowBigLeft />
      </button>
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">
          Civillians Login
        </h2>

        {message && (
          <div
            className={`text-sm mb-4 text-center ${
              message.includes("successful") ? "text-green-600" : "text-red-600"
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="admin@ranchi.gov.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 rounded-md text-white transition ${
              loading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <div className="text-center mt-6 text-sm text-gray-500">
          Don't have an account?{' '}
          <button onClick={()=>navigate("/register/citizen")} className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200">
            Sign up here
          </button>
        </div>

        <div className="mt-6 text-sm text-gray-500 text-center">
          <p>Demo Civilian Account:</p>
          <p>
            <strong>Email:</strong> rajesh@example.com
          </p>
          <p>
            <strong>Password:</strong> demo123
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
