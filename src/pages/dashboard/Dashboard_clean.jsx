import React, { useState, useRef, useCallback } from "react";
import Webcam from "react-webcam";

const categories = ["Roads", "Water", "Electricity", "Sanitation", "Other"];
const departments = [
  "Municipal Works",
  "Water Dept",
  "Electricity Dept",
  "Sanitation Dept",
  "General Admin",
];

const Dashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [form, setForm] = useState({
    photo: null,
    details: "",
    category: "Roads",
    department: "Municipal Works",
  });
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [photoMethod, setPhotoMethod] = useState(''); // 'file' or 'camera'
  const webcamRef = useRef(null);

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "photo" && files.length) {
      setForm({ ...form, photo: files[0] });
      setPhotoMethod('file');
      setCapturedImage(null); // Clear captured image if file is selected
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  // Camera functions
  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setCapturedImage(imageSrc);
    setPhotoMethod('camera');
    
    // Convert base64 to blob for form submission
    fetch(imageSrc)
      .then(res => res.blob())
      .then(blob => {
        setForm(f => ({ ...f, photo: blob }));
      });
    
    // Clear file input if camera photo is taken
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) fileInput.value = '';
    
    setShowCamera(false);
  }, [webcamRef]);

  const startCamera = () => {
    setShowCamera(true);
  };

  const stopCamera = () => {
    setShowCamera(false);
  };

  const removePhoto = () => {
    setForm(f => ({ ...f, photo: null }));
    setCapturedImage(null);
    setPhotoMethod('');
    
    // Clear file input
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) fileInput.value = '';
  };

  // Handle form submit - Save to db.json
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Create complaint data matching db.json structure
    const complaintData = {
      id: Date.now().toString(),
      userId: "1", // Current logged in user - you can get this from context/localStorage
      title: form.details.substring(0, 50) + (form.details.length > 50 ? "..." : ""),
      description: form.details,
      category: form.category,
      department: form.department,
      location: "Current Location", // You can implement geolocation
      photo: form.photo ? await convertPhotoToBase64(form.photo) : null,
      photoMethod: photoMethod,
      priority: "medium",
      status: "Submitted",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      // Save to local state
      setComplaints([complaintData, ...complaints]);

      // Here you would save to db.json via API call
      // For now, we'll just log it
      console.log("Complaint data for db.json:", complaintData);

      // Clear form and reset all states
      setForm({ photo: null, details: "", category: "Roads", department: "Municipal Works" });
      setCapturedImage(null);
      setShowCamera(false);
      setPhotoMethod('');
      
      // Reset file input
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = "";

      alert("Complaint submitted successfully!");
    } catch (error) {
      console.error("Error submitting complaint:", error);
      alert("Error submitting complaint. Please try again.");
    }
  };

  // Convert photo to base64 for storage
  const convertPhotoToBase64 = (file) => {
    return new Promise((resolve) => {
      if (photoMethod === 'camera') {
        resolve(capturedImage);
      } else {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(file);
      }
    });
  };

  return (
    <div
      className="dashboard"
      style={{ maxWidth: 700, margin: "0 auto", padding: 24 }}
    >
      <h1 style={{ textAlign: "center", marginBottom: 24 }}>User Dashboard</h1>
      <form
        className="complaint-form"
        onSubmit={handleSubmit}
        style={{
          border: "2px solid #1976d2",
          borderRadius: 12,
          padding: 24,
          marginBottom: 32,
          background: "#f9f9f9",
          boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
        }}
      >
        <h2 style={{ marginBottom: 16 }}>Submit a Complaint</h2>
        
        <label style={{ display: 'block', marginBottom: 12 }}>
          <span style={{ display: 'block', marginBottom: 4 }}>Photo:</span>
          
          {/* File upload option */}
          <div style={{ marginBottom: 8 }}>
            <input 
              type="file" 
              name="photo" 
              accept="image/*" 
              onChange={handleChange} 
              style={{ marginBottom: 8 }} 
            />
            {photoMethod === 'file' && form.photo && (
              <span style={{ color: '#4caf50', fontSize: 14, fontWeight: 'bold' }}>
                ✓ File selected
              </span>
            )}
          </div>
          
          {/* Camera option */}
          <button
            type="button"
            onClick={startCamera}
            style={{
              background: '#2196f3',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              padding: '8px 16px',
              cursor: 'pointer',
              fontWeight: 'bold',
              marginBottom: 8,
              display: 'block'
            }}
          >
            📷 Take Photo with Camera
          </button>
          
          {photoMethod === 'camera' && capturedImage && (
            <span style={{ color: '#4caf50', fontSize: 14, fontWeight: 'bold', display: 'block', marginBottom: 8 }}>
              ✓ Photo captured
            </span>
          )}

          {/* Camera view */}
          {showCamera && (
            <div style={{ marginBottom: 12, border: '2px solid #2196f3', borderRadius: 8, padding: 8 }}>
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                width={300}
                height={200}
                style={{ borderRadius: 6 }}
              />
              <div style={{ marginTop: 8, display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={capture}
                  style={{
                    background: '#4caf50',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    padding: '8px 16px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  📸 Capture Photo
                </button>
                <button
                  type="button"
                  onClick={stopCamera}
                  style={{
                    background: '#f44336',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    padding: '8px 16px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  ❌ Cancel
                </button>
              </div>
            </div>
          )}

          {/* Preview the active photo (either uploaded file or captured image) */}
          {form.photo && (
            <div style={{ marginTop: 8 }}>
              <img 
                src={photoMethod === 'camera' ? capturedImage : URL.createObjectURL(form.photo)} 
                alt="Preview" 
                width={100} 
                style={{ borderRadius: 6, border: '1px solid #ccc', marginBottom: 8 }} 
              />
              <div style={{ marginBottom: 8 }}>
                <span style={{ fontSize: 14, color: '#666' }}>
                  Method: {photoMethod === 'camera' ? '📷 Camera' : '📁 File Upload'}
                </span>
              </div>
              <button 
                type="button" 
                onClick={removePhoto}
                style={{ 
                  background: '#e57373', 
                  color: '#fff', 
                  border: 'none', 
                  borderRadius: 6, 
                  padding: '6px 12px', 
                  cursor: 'pointer' 
                }}
              >
                Remove Photo
              </button>
            </div>
          )}
        </label>

        <label style={{ display: "block", marginBottom: 12 }}>
          <span style={{ display: "block", marginBottom: 4 }}>
            Problem Details:
          </span>
          <textarea
            name="details"
            value={form.details}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              minHeight: 60,
              borderRadius: 6,
              border: "1px solid #ccc",
              padding: 8,
            }}
          />
        </label>

        <label style={{ display: "block", marginBottom: 12 }}>
          <span style={{ display: "block", marginBottom: 4 }}>Category:</span>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            style={{
              width: "100%",
              borderRadius: 6,
              border: "1px solid #ccc",
              padding: 8,
            }}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </label>

        <label style={{ display: "block", marginBottom: 12 }}>
          <span style={{ display: "block", marginBottom: 4 }}>Department:</span>
          <select
            name="department"
            value={form.department}
            onChange={handleChange}
            style={{
              width: "100%",
              borderRadius: 6,
              border: "1px solid #ccc",
              padding: 8,
            }}
          >
            {departments.map((dep) => (
              <option key={dep} value={dep}>
                {dep}
              </option>
            ))}
          </select>
        </label>

        <button
          type="submit"
          style={{
            background: "#1976d2",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            padding: "10px 24px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Submit Complaint
        </button>
      </form>

      <h2 style={{ marginBottom: 16 }}>Your Complaints</h2>
      <ul className="complaints-list" style={{ listStyle: "none", padding: 0 }}>
        {complaints.length === 0 && (
          <li
            style={{
              color: "#888",
              padding: 16,
              border: "1px dashed #ccc",
              borderRadius: 8,
            }}
          >
            No complaints submitted yet.
          </li>
        )}
        {complaints.map((c, idx) => (
          <li
            key={idx}
            className="complaint-item"
            style={{
              border: "2px solid #e57373",
              borderRadius: 10,
              padding: 18,
              marginBottom: 20,
              background: "#fff",
              boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
            }}
          >
            {c.photo && (
              <img
                src={c.photoMethod === 'camera' ? c.photo : URL.createObjectURL(new Blob([c.photo]))}
                alt="Complaint"
                width={100}
                style={{
                  borderRadius: 6,
                  border: "1px solid #ccc",
                  marginBottom: 8,
                }}
              />
            )}
            <div style={{ marginBottom: 6 }}>
              <strong>Title:</strong> {c.title}
            </div>
            <div style={{ marginBottom: 6 }}>
              <strong>Details:</strong> {c.description}
            </div>
            <div style={{ marginBottom: 6 }}>
              <strong>Category:</strong> {c.category}
            </div>
            <div style={{ marginBottom: 6 }}>
              <strong>Department:</strong> {c.department}
            </div>
            <div style={{ marginBottom: 6 }}>
              <strong>Status:</strong>{" "}
              <span style={{ color: "#1976d2", fontWeight: 600 }}>
                {c.status}
              </span>
            </div>
            <div style={{ marginBottom: 6 }}>
              <strong>Submitted:</strong> {new Date(c.createdAt).toLocaleString()}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Dashboard;
