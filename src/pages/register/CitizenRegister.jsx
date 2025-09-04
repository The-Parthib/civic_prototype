import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CitizenRegister = () => {
  const [form, setForm] = useState({
    name: '',
    municipality: '',
    phone: '',
    email: '',
    password: ''
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Add registration logic here
    navigate('/dashboard');
  };

  return (
    <div className="register-container">
      <h2>Citizen Registration</h2>
      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Name" value={form.name} onChange={handleChange} required />
        <input name="municipality" placeholder="Municipality Location" value={form.municipality} onChange={handleChange} required />
        <input name="phone" placeholder="Phone Number" value={form.phone} onChange={handleChange} required />
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
        <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required />
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default CitizenRegister;
