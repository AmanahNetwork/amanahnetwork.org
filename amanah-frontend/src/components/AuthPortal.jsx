import { useState } from 'react';
import api from '../api'; // Using the centralized API instance for consistent base URL and error handling  

function AuthPortal({ onAuthSuccess, onBack }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isLogin ? '/api/auth/login' : '/api/register';
    try {
      const res = await api.post(endpoint, formData);
      alert(res.data.message);
      if (isLogin) onAuthSuccess(res.data.user);
    } catch (err) {
      alert(err.response?.data?.error || "Authentication failed");
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: 'auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h2>{isLogin ? 'Board Member Login' : 'Register Account'}</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {!isLogin && <input placeholder="Full Name" onChange={e => setFormData({...formData, name: e.target.value})} required />}
        <input type="email" placeholder="Email" onChange={e => setFormData({...formData, email: e.target.value})} required />
        <input type="password" placeholder="Password" onChange={e => setFormData({...formData, password: e.target.value})} required />
        <button type="submit" style={{ padding: '10px', cursor: 'pointer' }}>{isLogin ? 'Login' : 'Register'}</button>
      </form>
      
      <div style={{ marginTop: '20px' }}>
        <button onClick={() => setIsLogin(!isLogin)} style={{ background: 'none', border: 'none', color: 'blue', cursor: 'pointer' }}>
          {isLogin ? 'Need an account? Register' : 'Have an account? Login'}
        </button>
        <br /><br />
        <button onClick={onBack} style={{ padding: '5px 15px', cursor: 'pointer' }}>← Back to Access Options</button>
      </div>
    </div>
  );
}

export default AuthPortal;