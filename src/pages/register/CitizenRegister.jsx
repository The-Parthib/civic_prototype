import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost";

const CitizenRegister = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    address: "",
    municipality: "",
    district: "",
    state: "",
    pincode: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // List of municipalities for dropdown
  const municipalities = [
    "Ranchi Municipal Corporation",
    "Dhanbad Municipal Corporation",
    "Jamshedpur Notified Area Committee",
    "Bokaro Steel City Corporation",
    "Deoghar Municipal Corporation",
    "Hazaribag Municipal Corporation",
    "Giridih Municipal Corporation",
    "Chaibasa Municipal Corporation",
  ];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    // Validation
    if (form.password !== form.confirmPassword) {
      setMessage("Passwords do not match");
      setLoading(false);
      return;
    }

    if (form.password.length < 6) {
      setMessage("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    // Check if all required fields are filled
    const requiredFields = [
      "name",
      "email",
      "phone",
      "password",
      "address",
      "municipality",
      "district",
      "state",
      "pincode",
    ];
    const missingFields = requiredFields.filter((field) => !form[field]);

    if (missingFields.length > 0) {
      setMessage(
        `Please fill in all required fields: ${missingFields.join(", ")}`
      );
      setLoading(false);
      return;
    }

    try {
      // Create user object matching db.json structure
      const newUser = {
        id: Date.now().toString(),
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password, // In real app, this should be hashed
        role: "citizen",
        location: `${form.district}, ${form.state}`,
        address: form.address,
        municipality: form.municipality,
        district: form.district,
        state: form.state,
        pincode: form.pincode,
        isVerified: false, // New users start as unverified
        createdAt: new Date().toISOString(),
      };

      // Send to json-server
      const response = await fetch(
        `https://jansamadhan-json-server.onrender.com/users`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newUser),
        }
      );

      if (response.ok) {
        setMessage("Registration successful! Redirecting to dashboard...");

        // Store user info in localStorage for session management
        localStorage.setItem("currentUser", JSON.stringify(newUser));

        // Redirect to dashboard after successful registration
        setTimeout(() => {
          navigate("/dashboard");
        }, 2000);
      } else {
        const errorData = await response.json();
        setMessage(
          `Registration failed: ${errorData.message || "Unknown error"}`
        );
      }
    } catch (error) {
      console.error("Registration error:", error);
      setMessage(
        "Registration failed. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: 500,
        margin: "0 auto",
        padding: 24,
        background: "#f5f5f5",
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: 32,
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            marginBottom: 24,
            color: "#1976d2",
            fontSize: 24,
          }}
        >
          Citizen Registration
        </h2>

        {message && (
          <div
            style={{
              padding: 12,
              marginBottom: 20,
              borderRadius: 6,
              background: message.includes("successful")
                ? "#d4edda"
                : "#f8d7da",
              color: message.includes("successful") ? "#155724" : "#721c24",
              border: `1px solid ${
                message.includes("successful") ? "#c3e6cb" : "#f5c6cb"
              }`,
            }}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <input
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: 12,
              marginBottom: 16,
              border: "1px solid #ccc",
              borderRadius: 6,
              fontSize: 14,
            }}
          />

          <input
            name="email"
            type="email"
            placeholder="Email Address"
            value={form.email}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: 12,
              marginBottom: 16,
              border: "1px solid #ccc",
              borderRadius: 6,
              fontSize: 14,
            }}
          />

          <input
            name="phone"
            type="tel"
            placeholder="Phone Number (+91-9876543210)"
            value={form.phone}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: 12,
              marginBottom: 16,
              border: "1px solid #ccc",
              borderRadius: 6,
              fontSize: 14,
            }}
          />

          <textarea
            name="address"
            placeholder="Complete Address"
            value={form.address}
            onChange={handleChange}
            required
            rows={3}
            style={{
              width: "100%",
              padding: 12,
              marginBottom: 16,
              border: "1px solid #ccc",
              borderRadius: 6,
              fontSize: 14,
              resize: "vertical",
            }}
          />

          <select
            name="municipality"
            value={form.municipality}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: 12,
              marginBottom: 16,
              border: "1px solid #ccc",
              borderRadius: 6,
              fontSize: 14,
            }}
          >
            <option value="">Select Municipality</option>
            {municipalities.map((municipality) => (
              <option key={municipality} value={municipality}>
                {municipality}
              </option>
            ))}
          </select>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
              marginBottom: 16,
            }}
          >
            <input
              name="district"
              placeholder="District"
              value={form.district}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: 12,
                border: "1px solid #ccc",
                borderRadius: 6,
                fontSize: 14,
              }}
            />

            <input
              name="state"
              placeholder="State"
              value={form.state}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: 12,
                border: "1px solid #ccc",
                borderRadius: 6,
                fontSize: 14,
              }}
            />
          </div>

          <input
            name="pincode"
            placeholder="Pincode (6 digits)"
            value={form.pincode}
            onChange={handleChange}
            required
            pattern="[0-9]{6}"
            style={{
              width: "100%",
              padding: 12,
              marginBottom: 16,
              border: "1px solid #ccc",
              borderRadius: 6,
              fontSize: 14,
            }}
          />

          <input
            name="password"
            type="password"
            placeholder="Password (min 6 characters)"
            value={form.password}
            onChange={handleChange}
            required
            minLength={6}
            style={{
              width: "100%",
              padding: 12,
              marginBottom: 16,
              border: "1px solid #ccc",
              borderRadius: 6,
              fontSize: 14,
            }}
          />

          <input
            name="confirmPassword"
            type="password"
            placeholder="Confirm Password"
            value={form.confirmPassword}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: 12,
              marginBottom: 24,
              border: "1px solid #ccc",
              borderRadius: 6,
              fontSize: 14,
            }}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: 14,
              background: loading ? "#ccc" : "#1976d2",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              fontSize: 16,
              fontWeight: "bold",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CitizenRegister;
