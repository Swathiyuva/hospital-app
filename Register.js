import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Auth.css';
import { toast } from 'react-toastify';

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '' });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const existingUser = JSON.parse(localStorage.getItem('user'));

    if (existingUser && existingUser.email === form.email) {
  toast.error('⚠️ This email is already registered.');
  navigate('/');
  return;
}

if (form.password !== form.confirmPassword) {
  toast.error("❌ Passwords don't match");
  return;
}

localStorage.setItem('user', JSON.stringify({ email: form.email, password: form.password }));
toast.success('✅ Registration Successful!');
navigate('/');

  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Create Your SHRS Account</h2>
        <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
        <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
        <input type="password" name="confirmPassword" placeholder="Confirm Password" onChange={handleChange} required />
        <button type="submit">Register</button>
        <p onClick={() => navigate('/')}>Already have an account? Login</p>
      </form>
    </div>
  );
};

export default Register;
