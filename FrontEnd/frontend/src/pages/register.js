import './AuthForm.css';
import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../UserContext';

function Register() {
  const { setUser } = useContext(UserContext); 
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const newErrors = {};

    if (!form.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (/[^a-zA-Z\s]/.test(form.name)) {
      newErrors.name = 'Name must not contain numbers or special characters';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(form.email)) {
      newErrors.email = 'Invalid email format';
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
    if (!form.password) {
      newErrors.password = 'Password is required';
    } else if (!passwordRegex.test(form.password)) {
      newErrors.password =
        'Password must be at least 8 characters and include a letter, number, and symbol';
    }

    if (!form.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (form.confirmPassword !== form.password) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {

      const res = await fetch('http://localhost:5000/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
        }),
        credentials: 'include', 
      });

      const data = await res.json();

      if (!res.ok) {
        alert('Error: ' + (data.error?.sqlMessage || data.error || 'Failed to register'));
        return;
      }

      const loginRes = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: form.email, password: form.password }),
      });

      const loginData = await loginRes.json();

      if (loginRes.ok && loginData.loggedIn) {
        setUser(loginData.user);
        navigate('/'); 
      } else {
        alert('Registered successfully! Please log in.');
        navigate('/login');
      }
    } catch (err) {
      console.error('Registration failed:', err);
      alert('Something went wrong!');
    }
  };

  return (
    <div className="auth-container">
      <h2>Register</h2>
      <form onSubmit={handleSubmit} noValidate>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Full Name"
        />
        {errors.name && <p className="error-text">{errors.name}</p>}

        <input
          name="email"
          type="text"
          value={form.email}
          onChange={handleChange}
          placeholder="Email"
        />
        {errors.email && <p className="error-text">{errors.email}</p>}

        <input
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Password"
        />
        {errors.password && <p className="error-text">{errors.password}</p>}

        <input
          name="confirmPassword"
          type="password"
          value={form.confirmPassword}
          onChange={handleChange}
          placeholder="Confirm Password"
        />
        {errors.confirmPassword && (
          <p className="error-text">{errors.confirmPassword}</p>
        )}

        <button type="submit">Register</button>
      </form>
      <p className="switch-text">
        Already a user? <Link to="/login">Login here</Link>
      </p>
    </div>
  );
}

export default Register;
