import React, { useState } from "react";

const port = import.meta.env.VITE_DB_PORT;

const Register = () => {
  const [formData, setFormData] = useState({
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
    role: "citizen", // Default to citizen
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

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

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setMessage("Passwords do not match");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
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
    const missingFields = requiredFields.filter((field) => !formData[field]);

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
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password, // In real app, this should be hashed
        role: formData.role,
        location: `${formData.district}, ${formData.state}`,
        address: formData.address,
        municipality: formData.municipality,
        district: formData.district,
        state: formData.state,
        pincode: formData.pincode,
        isVerified: false, // New users start as unverified
        createdAt: new Date().toISOString(),
      };

      // Send to json-server
      const response = await fetch(`http://localhost:${port}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUser),
      });

      if (response.ok) {
        setMessage("Registration successful! You can now login.");
        // Clear form
        setFormData({
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
          role: "citizen",
        });

        // Redirect to login after successful registration
        setTimeout(() => {
          window.location.href = "/login";
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
        maxWidth: 600,
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
        <h1
          style={{
            textAlign: "center",
            marginBottom: 32,
            color: "#1976d2",
            fontSize: 28,
            fontWeight: "bold",
          }}
        >
          Citizen Registration
        </h1>

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
          {/* Personal Information */}
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ marginBottom: 16, color: "#333" }}>
              Personal Information
            </h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
                marginBottom: 16,
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: 4,
                    fontWeight: "bold",
                  }}
                >
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  style={{
                    width: "100%",
                    padding: 10,
                    border: "1px solid #ccc",
                    borderRadius: 6,
                    fontSize: 14,
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: 4,
                    fontWeight: "bold",
                  }}
                >
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  placeholder="+91-9876543210"
                  style={{
                    width: "100%",
                    padding: 10,
                    border: "1px solid #ccc",
                    borderRadius: 6,
                    fontSize: 14,
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  display: "block",
                  marginBottom: 4,
                  fontWeight: "bold",
                }}
              >
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  padding: 10,
                  border: "1px solid #ccc",
                  borderRadius: 6,
                  fontSize: 14,
                }}
              />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: 4,
                    fontWeight: "bold",
                  }}
                >
                  Password *
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  style={{
                    width: "100%",
                    padding: 10,
                    border: "1px solid #ccc",
                    borderRadius: 6,
                    fontSize: 14,
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: 4,
                    fontWeight: "bold",
                  }}
                >
                  Confirm Password *
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  style={{
                    width: "100%",
                    padding: 10,
                    border: "1px solid #ccc",
                    borderRadius: 6,
                    fontSize: 14,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ marginBottom: 16, color: "#333" }}>
              Address Information
            </h3>

            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  display: "block",
                  marginBottom: 4,
                  fontWeight: "bold",
                }}
              >
                Full Address *
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                rows={3}
                placeholder="Enter your complete address"
                style={{
                  width: "100%",
                  padding: 10,
                  border: "1px solid #ccc",
                  borderRadius: 6,
                  fontSize: 14,
                  resize: "vertical",
                }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  display: "block",
                  marginBottom: 4,
                  fontWeight: "bold",
                }}
              >
                Municipality *
              </label>
              <select
                name="municipality"
                value={formData.municipality}
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  padding: 10,
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
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: 16,
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: 4,
                    fontWeight: "bold",
                  }}
                >
                  District *
                </label>
                <input
                  type="text"
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Ranchi"
                  style={{
                    width: "100%",
                    padding: 10,
                    border: "1px solid #ccc",
                    borderRadius: 6,
                    fontSize: 14,
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: 4,
                    fontWeight: "bold",
                  }}
                >
                  State *
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Jharkhand"
                  style={{
                    width: "100%",
                    padding: 10,
                    border: "1px solid #ccc",
                    borderRadius: 6,
                    fontSize: 14,
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: 4,
                    fontWeight: "bold",
                  }}
                >
                  Pincode *
                </label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  required
                  pattern="[0-9]{6}"
                  placeholder="834001"
                  style={{
                    width: "100%",
                    padding: 10,
                    border: "1px solid #ccc",
                    borderRadius: 6,
                    fontSize: 14,
                  }}
                />
              </div>
            </div>
          </div>

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
              marginBottom: 16,
            }}
          >
            {loading ? "Registering..." : "Register as Citizen"}
          </button>

          <div style={{ textAlign: "center" }}>
            <span style={{ color: "#666" }}>Already have an account? </span>
            <a
              href="/login"
              style={{
                color: "#1976d2",
                textDecoration: "none",
                fontWeight: "bold",
              }}
            >
              Login here
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
