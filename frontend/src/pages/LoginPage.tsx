import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/authService';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const user = await login(email, password);
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
      navigate('/activity-log');
    } else {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h1 className="login-title">Locker Management System</h1>
        <form className="login-box" onSubmit={handleSubmit}>
          <h2>Sign In</h2>

          <label htmlFor="email" className="input-label">Email</label>
          <input
            id="email"
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="large-input"
          />

          <label htmlFor="password" className="input-label">Password</label>
          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="large-input"
          />

          {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}

          <button type="submit" className="blue-button">Next</button>
        </form>
      </div>
    </div>
  );
}
