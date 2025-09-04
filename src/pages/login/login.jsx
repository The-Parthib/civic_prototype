import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [role, setRole] = useState('citizen');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (role === 'citizen') {
      navigate('/p');
    } else {
      navigate('/admin');
    }
  };

  return (
    <div className="login-panel">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <select value={role} onChange={e => setRole(e.target.value)}>
          <option value="citizen">Citizen</option>
          <option value="admin">Admin</option>
        </select>
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;