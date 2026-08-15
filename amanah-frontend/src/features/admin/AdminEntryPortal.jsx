import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import logo from '../../amanahlogo.png';

export default function AdminEntryPortal() {
  const navigate = useNavigate();
  const [creds, setCreds] = useState({ email: '', password: '' });

  const handleLogin = async () => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!creds.email || !emailRegex.test(creds.email.trim())) {
      alert("Please enter a valid email address.");
      return;
    }
    if (!creds.password) {
      alert("Please enter your access password.");
      return;
    }
    try {
      await api.post('/api/auth/login', creds);
      
      sessionStorage.setItem('agentUserAuth', 'true'); 
      sessionStorage.setItem('userAuth', 'true'); 
      navigate('/transferaid');
    } catch (err) { 
      console.error("Login failed:", err);
      alert(err.response?.data?.error || "Access Denied: Invalid Credentials"); 
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white font-mono p-4">
      <div className="w-full max-w-sm border-2 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex justify-center mb-4">
          <img src={logo} alt="Amanah Network Logo" className="h-16 w-auto object-contain" />
        </div>
        <h2 className="text-2xl font-black mb-6 uppercase text-center text-[#284D3D]">Agent Login</h2>
        
        <div className="flex flex-col gap-4">
          <input 
            type="email"
            className="border-2 border-black p-3 w-full"
            placeholder="EMAIL ADDRESS" 
            onChange={(e) => setCreds({...creds, email: e.target.value})} 
          />
          <input 
            type="password" 
            className="border-2 border-black p-3 w-full"
            placeholder="ACCESS PASSWORD" 
            onChange={(e) => setCreds({...creds, password: e.target.value})} 
          />
          <button 
            onClick={handleLogin}
            className="bg-black text-white py-3 font-bold uppercase hover:bg-[#284D3D] transition-colors"
          >
            Authorize Entry
          </button>
        </div>

        <button 
          onClick={() => navigate('/enrollment')}
          className="mt-6 text-xs text-gray-500 underline uppercase tracking-widest w-full text-center"
        >
          Request Agent Enrollment
        </button>
      </div>
    </div>
  );
}