import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../amanahlogo.png';

export default function AccessPortal() {
  const [key, setKey] = useState('');
  const navigate = useNavigate();

  const handleUnlock = (e) => {
    if (e) e.preventDefault();
    const cleanKey = (key || '').trim();
    const targetKey = (import.meta.env.VITE_GOVERNANCE_KEY || '').trim();
    if (cleanKey && cleanKey === targetKey) {
      sessionStorage.setItem('transferGovAuth', 'true');
      sessionStorage.setItem('govAuth', 'true');
      localStorage.setItem('governanceKey', cleanKey);
      setKey(''); 
      navigate('/admin-login'); 
    } else {
      alert("Invalid Governance Key");
      setKey(''); // Clear invalid key
    }
  };

  return (
    <form onSubmit={handleUnlock} className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-10">
      <img src={logo} alt="Amanah Network Logo" className="h-20 w-auto mb-6 object-contain" />
      <h2 className="text-xl font-bold mb-6 uppercase tracking-widest text-[#284D3D]">Governance Access</h2>
      <input 
        type="password" 
        className="border-2 border-black p-3 mb-4 w-64 text-center"
        value={key}
        onChange={(e) => setKey(e.target.value)} 
        placeholder="Enter Governance Key"
      />
      <button 
        type="submit"
        className="bg-black text-white px-8 py-3 font-bold hover:bg-gray-800 transition"
      >
        VERIFY & PROCEED
      </button>
    </form>
  );
}