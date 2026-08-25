import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';

export default function EnrollAgent() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ email: '', otp: '', password: '', name: '' });
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const sendOtp = async () => {
    if (!formData.email) {
      alert("Please enter your email address.");
      return;
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(formData.email.trim())) {
      alert("Please enter a valid email address (e.g., user@domain.com).");
      return;
    }
    setIsLoading(true);
    try {
      const res = await api.post('/api/auth/send-otp', { email: formData.email });
      if (res.data.debugOtp) {
        setFormData(prev => ({ ...prev, otp: res.data.debugOtp }));
      }
      alert("OTP sent to your email!");
    } catch (err) {
      alert(err.response?.data?.error || "Failed to send OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!formData.otp) {
      alert("Please enter the OTP.");
      return;
    }
    setIsLoading(true);
    try {
      const res = await api.post('/api/auth/verify-otp', { email: formData.email, otp: formData.otp });
      if (res.data.verified) {
        setIsVerified(true);
        setStep(2);
      } else {
        alert("Invalid OTP.");
      }
    } catch (err) {
      alert(err.response?.data?.error || "Invalid OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  const finalizeEnrollment = async () => {
    if (!formData.name || !formData.password) {
      alert("Please provide both Full Name and Password.");
      return;
    }
    
    // Password Strength Check: At least 6 chars, 1 uppercase letter, 1 special character
    const passwordRegex = /^(?=.*[A-Z])(?=.*[@$!%*?&#^()_+\-=\[\]{};':"\\|,.<>\/?]).{6,}$/;
    if (!passwordRegex.test(formData.password)) {
      alert("Password must be at least 6 characters long and contain at least 1 uppercase letter (A-Z) and 1 special character (e.g., @, #, !).");
      return;
    }

    setIsLoading(true);
    try {
      const govKey = localStorage.getItem('governanceKey') || import.meta.env.VITE_GOVERNANCE_KEY;
      await api.post('/api/admin/enroll-agent', { 
        name: formData.name,
        email: formData.email,
        password: formData.password,
        otpVerified: isVerified,
        secretKey: govKey
      });
      alert("Agent Enrollment Successful! Redirecting to login...");
      navigate('/admin-login');
    } catch (err) {
      alert(err.response?.data?.error || "Enrollment Failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white font-mono p-4">
      <div className="w-full max-w-md border-2 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <h2 className="text-2xl font-black mb-2 uppercase text-center text-[#284D3D]">Agent Enrollment</h2>
        <p className="text-xs uppercase tracking-widest text-center text-gray-500 mb-6">Step {step} of 2</p>

        {step === 1 && (
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-1">Email Address</label>
              <input 
                type="email"
                className="border-2 border-black p-3 w-full"
                placeholder="agent@amanah.com" 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})} 
              />
            </div>
            
            <button 
              type="button"
              disabled={isLoading}
              className="bg-black text-white py-3 font-bold uppercase hover:bg-[#284D3D] transition-colors disabled:bg-gray-400"
              onClick={sendOtp}
            >
              {isLoading ? 'Sending...' : 'Send Verification OTP'}
            </button>

            <div className="mt-2">
              <label className="block text-xs font-bold uppercase tracking-widest mb-1">Enter 6-Digit OTP</label>
              <input 
                type="text"
                className="border-2 border-black p-3 w-full"
                placeholder="123456" 
                value={formData.otp}
                onChange={(e) => setFormData({...formData, otp: e.target.value})} 
              />
            </div>

            <button 
              type="button"
              disabled={isLoading}
              className="bg-[#284D3D] text-white py-3 font-bold uppercase hover:bg-black transition-colors disabled:bg-gray-400"
              onClick={verifyOtp}
            >
              {isLoading ? 'Verifying...' : 'Verify OTP'}
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-4">
            <div className="bg-green-50 border border-green-200 text-green-700 p-3 text-xs font-bold uppercase mb-2">
              [VERIFIED] Email Verified: {formData.email}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-1">Full Name</label>
              <input 
                type="text"
                className="border-2 border-black p-3 w-full"
                placeholder="Agent Full Name" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})} 
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-1">Set Account Password (Min 6 Chars, 1 Uppercase, 1 Special Char e.g. @)</label>
              <input 
                type="password"
                className="border-2 border-black p-3 w-full"
                placeholder="e.g. Amanah@2026" 
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})} 
              />
            </div>

            <button 
              type="button"
              disabled={isLoading}
              className="bg-[#C5A059] text-white py-3 font-bold uppercase hover:bg-black transition-colors disabled:bg-gray-400 mt-2"
              onClick={finalizeEnrollment}
            >
              {isLoading ? 'Enrolling...' : 'Complete Enrollment'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}