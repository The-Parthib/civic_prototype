import React, { useState, useRef } from "react";

const categories = ["Roads", "Water", "Electricity", "Sanitation", "Other"];
const departments = ["Municipal Works", "Water Dept", "Electricity Dept", "Sanitation Dept", "General Admin"];

const Dashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [form, setForm] = useState({
    photo: null,
    audio: null,
    details: "",
    category: "Roads",
    department: "Municipal Works"
  });
  const [audioURL, setAudioURL] = useState(null);
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "photo" && files.length) {
      setForm({ ...form, photo: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  // Audio recording handlers
  const startRecording = async () => {
    try {
      setRecording(true);
      audioChunksRef.current = [];
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };
      
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setForm(f => ({ ...f, audio: audioBlob }));
        setAudioURL(URL.createObjectURL(audioBlob));
        
        // Stop all tracks to free up the microphone
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorderRef.current.start();
    } catch (error) {
      console.error('Error starting recording:', error);
      setRecording(false);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      setRecording(false);
      mediaRecorderRef.current.stop();
    }
  };

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    const newComplaint = {
      ...form,
      id: Date.now(), // Add unique ID
      timestamp: new Date().toLocaleString(),
      status: "Submitted"
    };
    setComplaints([newComplaint, ...complaints]);
    
    // Clear form and reset file input
    setForm({ photo: null, audio: null, details: "", category: "Roads", department: "Municipal Works" });
    setAudioURL(null);
    
    // Reset file input
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) fileInput.value = '';
  };

  return (
    <div className="dashboard" style={{ maxWidth: 700, margin: '0 auto', padding: 24 }}>
      <h1 style={{ textAlign: 'center', marginBottom: 24 }}>User Dashboard</h1>
      <form
        className="complaint-form"
        onSubmit={handleSubmit}
        style={{
          border: '2px solid #1976d2',
          borderRadius: 12,
          padding: 24,
          marginBottom: 32,
          background: '#f9f9f9',
          boxShadow: '0 2px 8px rgba(0,0,0,0.07)'
        }}
      >
        <h2 style={{ marginBottom: 16 }}>Submit a Complaint</h2>
        <label style={{ display: 'block', marginBottom: 12 }}>
          <span style={{ display: 'block', marginBottom: 4 }}>Photo:</span>
          <input type="file" name="photo" accept="image/*" onChange={handleChange} />
          {form.photo && (
            <div style={{ marginTop: 8 }}>
              <img src={URL.createObjectURL(form.photo)} alt="Preview" width={100} style={{ borderRadius: 6, border: '1px solid #ccc', marginBottom: 8 }} />
              <button type="button" style={{ marginLeft: 8, background: '#e57373', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 12px', cursor: 'pointer' }} onClick={() => setForm(f => ({ ...f, photo: null }))}>Remove Image</button>
            </div>
          )}
        </label>
        <label style={{ display: 'block', marginBottom: 12 }}>
          <span style={{ display: 'block', marginBottom: 4 }}>Audio:</span>
          {(!recording && !audioURL) && (
            <button type="button" onClick={startRecording} style={{ marginRight: 8, background: '#4caf50', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', cursor: 'pointer', fontWeight: 'bold' }}>🎙️ Record Audio</button>
          )}
          {recording && (
            <button type="button" onClick={stopRecording} style={{ marginRight: 8, background: '#f44336', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', cursor: 'pointer', fontWeight: 'bold' }}>⏹️ Stop Recording</button>
          )}
          {audioURL && (
            <div style={{ marginTop: 8 }}>
              <audio src={audioURL} controls style={{ display: 'block', marginBottom: 8 }} />
              <button
                type="button"
                style={{ background: '#4caf50', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', cursor: 'pointer', fontWeight: 'bold' }}
                onClick={() => {
                  // Clear current audio first
                  setForm(f => ({ ...f, audio: null }));
                  if (audioURL) {
                    URL.revokeObjectURL(audioURL);
                  }
                  setAudioURL(null);
                  audioChunksRef.current = [];
                  
                  // Start new recording immediately
                  startRecording();
                }}
              >
                🎙️ Record New
              </button>
            </div>
          )}
        </label>
        <label style={{ display: 'block', marginBottom: 12 }}>
          <span style={{ display: 'block', marginBottom: 4 }}>Problem Details:</span>
          <textarea name="details" value={form.details} onChange={handleChange} required style={{ width: '100%', minHeight: 60, borderRadius: 6, border: '1px solid #ccc', padding: 8 }} />
        </label>
        <label style={{ display: 'block', marginBottom: 12 }}>
          <span style={{ display: 'block', marginBottom: 4 }}>Category:</span>
          <select name="category" value={form.category} onChange={handleChange} style={{ width: '100%', borderRadius: 6, border: '1px solid #ccc', padding: 8 }}>
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </label>
        <label style={{ display: 'block', marginBottom: 12 }}>
          <span style={{ display: 'block', marginBottom: 4 }}>Department:</span>
          <select name="department" value={form.department} onChange={handleChange} style={{ width: '100%', borderRadius: 6, border: '1px solid #ccc', padding: 8 }}>
            {departments.map(dep => <option key={dep} value={dep}>{dep}</option>)}
          </select>
        </label>
        <button type="submit" style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 24px', fontWeight: 600, cursor: 'pointer' }}>Submit Complaint</button>
      </form>

      <h2 style={{ marginBottom: 16 }}>Your Complaints</h2>
      <ul className="complaints-list" style={{ listStyle: 'none', padding: 0 }}>
        {complaints.length === 0 && <li style={{ color: '#888', padding: 16, border: '1px dashed #ccc', borderRadius: 8 }}>No complaints submitted yet.</li>}
        {complaints.map((c, idx) => (
          <li
            key={idx}
            className="complaint-item"
            style={{
              border: '2px solid #e57373',
              borderRadius: 10,
              padding: 18,
              marginBottom: 20,
              background: '#fff',
              boxShadow: '0 1px 4px rgba(0,0,0,0.05)'
            }}
          >
            {c.photo && <img src={URL.createObjectURL(c.photo)} alt="Complaint" width={100} style={{ borderRadius: 6, border: '1px solid #ccc', marginBottom: 8 }} />}
            {c.audio && <audio src={URL.createObjectURL(c.audio)} controls style={{ display: 'block', marginBottom: 8 }} />}
            <div style={{ marginBottom: 6 }}><strong>Details:</strong> {c.details}</div>
            <div style={{ marginBottom: 6 }}><strong>Category:</strong> {c.category}</div>
            <div style={{ marginBottom: 6 }}><strong>Department:</strong> {c.department}</div>
            <div style={{ marginBottom: 6 }}><strong>Status:</strong> <span style={{ color: '#1976d2', fontWeight: 600 }}>{c.status}</span></div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Dashboard;
