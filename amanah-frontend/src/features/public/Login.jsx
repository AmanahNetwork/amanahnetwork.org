import { useState } from 'react';
import api from '../../api'; // Using the centralized API instance for consistent base URL and error handling

// We pass a function called multiSetUser down from App.jsx to save our login session globally
export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post('/api/auth/login', { email });
      // Pass the authenticated user data back up to the global React app state
      onLoginSuccess(response.data.user); 
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Authentication system offline.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', fontFamily: 'sans-serif' }}>
      <h2>Amanah Secure Gate</h2>
      <p>Enter your network identity email to establish an authorized session context.</p>

      {error && <div style={{ color: 'red', marginBottom: '15px' }}>{error}</div>}

      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label>Network Identity Email</label><br />
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            placeholder="e.g., board@amanah.com"
            required 
            style={{ width: '100%', padding: '8px', marginTop: '5px' }} 
          />
        </div>
        <button type="submit" disabled={isLoading} style={{ padding: '10px', backgroundColor: '#2d3748', color: 'white', border: 'none', cursor: 'pointer' }}>
          {isLoading ? 'Verifying permissions...' : 'Authenticate Token'}
        </button>
      </form>
    </div>
  );
}