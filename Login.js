import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Auth.css';
import { toast } from 'react-toastify';

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '' });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (
  storedUser &&
  storedUser.email === form.email &&
  storedUser.password === form.password
) {
  localStorage.setItem('isLoggedIn', 'true');
  toast.success('✅ Login successful!');
  navigate('/dashboard');
} else {
  toast.error('❌ Invalid credentials!');
}

  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit} autoComplete="off">
        <h2>Login to SHRS</h2>
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          onFocus={() => setForm({ ...form, username: '' })}
          required
          autoComplete="off"
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          onFocus={() => setForm({ ...form, email: '' })}
          required
          autoComplete="off"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          onFocus={() => setForm({ ...form, password: '' })}
          required
          autoComplete="new-password"
        />
        <button type="submit">Login</button>
        <p onClick={() => navigate('/register')}>Don't have an account? Register</p>
      </form>
    </div>
  );
};

export default Login;
