import { useState } from 'react';
import api from '../../api';

export default function Register() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'DONOR',
    mobileNumber: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isValidEmail(formData.email)) {
      alert("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await api.post('/api/register', formData);
      
      console.log("Success:", response.data);
      alert(response.data.message); 
      setSuccess(true);
      setFormData({ firstName: '', lastName: '', email: '', role: 'DONOR', mobileNumber: '' });

    } catch (err) {
      console.error("Registration failed:", err.response?.data || err.message);
      const errorMessage = err.response?.data?.error || "Failed to connect to the server.";
      setError(errorMessage);
      alert("Registration failed: " + errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="py-24 px-6 md:px-12 lg:px-24">
      <header className="mb-12 text-left">
        <strong> <span className="text-[#284D3D] font-mono tracking-[0.2em] uppercase text-xs mb-6 block">REGISTER AND DONATE FOR THE BETTER CAUSE</span></strong>
        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-[0.9]">Create an<br /> Amanah Account.</h2>
      </header>
      
      {error && <div className="p-4 mb-6 bg-red-50 text-red-600 border border-red-200 font-bold uppercase tracking-widest text-xs max-w-xl">❌ {error}</div>}
      {success && <div className="p-4 mb-6 bg-green-50 text-green-700 border border-green-200 font-bold uppercase tracking-widest text-xs max-w-xl">✅ Account created successfully! Please check your email.</div>}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-xl">
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest mb-2">First Name</label>
          <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required className="w-full p-4 border-2 border-black focus:border-[#C5A059] outline-none transition-colors" />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-widest mb-2">Last Name</label>
          <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required className="w-full p-4 border-2 border-black focus:border-[#C5A059] outline-none transition-colors" />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-widest mb-2">Email Address</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full p-4 border-2 border-black focus:border-[#C5A059] outline-none transition-colors" />
        </div>
       <div>
        <label className="block text-xs font-bold uppercase tracking-widest mb-2">Mobile Number (Optional)</label>
        <input 
          type="tel" 
          name="mobileNumber" 
          value={formData.mobileNumber} 
          onChange={handleChange} 
         className="w-full p-4 border-2 border-black focus:border-[#C5A059] outline-none transition-colors"/>
        </div>
        <button 
          type="submit" 
          disabled={isLoading}
          className={`w-full p-4 font-bold uppercase tracking-widest transition-all duration-300 ${isLoading ? 'bg-gray-200 cursor-not-allowed' : 'bg-[#284D3D] text-white border-2 border-black hover:bg-black hover:text-white'}`}
        >
          {isLoading ? 'Creating Account...' : 'Register'}
        </button>
      </form>
    </div>
  );
}