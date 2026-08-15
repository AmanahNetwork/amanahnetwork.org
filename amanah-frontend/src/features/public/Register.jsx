import { useState } from 'react';
import api from '../../api';

export default function Register() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    otp: '',
    role: 'DONOR',
    mobileNumber: ''
  });

  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };

  const isValidEmail = (email) => {
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test((email || '').trim());
  };

  const isValidPhone = (phone) => {
    if (!phone || !phone.trim()) return true;
    const cleanPhone = phone.trim().replace(/[\s\-\+]/g, '');
    return /^\d{10,15}$/.test(cleanPhone);
  };

  const handleSendOtp = async () => {
    if (!isValidEmail(formData.email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.post('/api/auth/send-otp', { email: formData.email });
      setOtpSent(true);
      if (res.data.debugOtp) {
        setFormData(prev => ({ ...prev, otp: res.data.debugOtp }));
      }
      setError(null);
    } catch (err) {
      console.error("OTP send error:", err);
      setError(err.response?.data?.error || "Failed to send verification OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!formData.otp || formData.otp.trim().length < 4) {
      setError("Please enter the verification OTP sent to your email.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.post('/api/auth/verify-otp', { email: formData.email, otp: formData.otp });
      if (res.data.verified) {
        setIsEmailVerified(true);
        setStep(2);
        setError(null);
      } else {
        setError("Invalid verification code. Please check your email.");
      }
    } catch (err) {
      console.error("OTP verification error:", err);
      setError(err.response?.data?.error || "Invalid verification code.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isEmailVerified) {
      setError("Please verify your email address via OTP first.");
      return;
    }

    if (!formData.firstName || !formData.lastName) {
      setError("First Name and Last Name are required.");
      return;
    }

    if (formData.mobileNumber && !isValidPhone(formData.mobileNumber)) {
      setError("Please enter a valid 10-digit mobile number starting with 6-9.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await api.post('/api/register', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        mobileNumber: formData.mobileNumber,
        role: formData.role,
        otpVerified: true
      });
      
      console.log("Registration Success:", response.data);
      setSuccess(true);
      setFormData({ firstName: '', lastName: '', email: '', otp: '', role: 'DONOR', mobileNumber: '' });
      setIsEmailVerified(false);
      setOtpSent(false);
      setStep(1);

    } catch (err) {
      console.error("Registration failed:", err.response?.data || err.message);
      const errorMessage = err.response?.data?.error || "Failed to connect to the server.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="py-24 px-6 md:px-12 lg:px-24 font-sans">
      <header className="mb-12 text-left">
        <strong>
          <span className="text-[#284D3D] font-mono tracking-[0.2em] uppercase text-xs mb-4 block">
            REGISTER AND DONATE FOR THE BETTER CAUSE
          </span>
        </strong>
        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-[0.9]">
          Create an<br /> Amanah Account.
        </h2>
        <p className="text-xs uppercase font-mono text-gray-500 mt-4 tracking-widest">Step {step} of 2</p>
      </header>
      
      {error && <div className="p-4 mb-6 bg-red-50 text-red-600 border border-red-200 font-bold uppercase tracking-widest text-xs max-w-xl">❌ {error}</div>}
      {success && <div className="p-4 mb-6 bg-green-50 text-green-700 border border-green-200 font-bold uppercase tracking-widest text-xs max-w-xl">✅ Account created successfully! Thank you for joining Amanah Network.</div>}

      {step === 1 && (
        <div className="flex flex-col gap-6 max-w-xl">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest mb-2">Email Authentication</label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input 
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={handleChange} 
                placeholder="Enter your email address"
                disabled={otpSent || isLoading}
                required 
                className="w-full p-4 border-2 border-black focus:border-[#C5A059] outline-none transition-colors disabled:bg-gray-100" 
              />
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={isLoading || !formData.email}
                className="px-6 py-4 bg-black text-white font-bold uppercase text-xs tracking-widest hover:bg-[#284D3D] transition-colors whitespace-nowrap disabled:bg-gray-400"
              >
                {isLoading ? 'Sending...' : otpSent ? 'Resend OTP' : 'Send OTP'}
              </button>
            </div>
          </div>

          {otpSent && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 text-blue-800 p-3 text-xs font-mono font-semibold">
                ✉️ A 6-digit OTP code has been sent to <strong>{formData.email}</strong>.
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-2">Enter 6-Digit OTP Code</label>
                <input 
                  type="text" 
                  name="otp" 
                  value={formData.otp} 
                  onChange={handleChange} 
                  placeholder="e.g. 123456"
                  maxLength="6"
                  required 
                  className="w-full p-4 border-2 border-black focus:border-[#C5A059] outline-none tracking-widest font-mono text-lg" 
                />
              </div>

              <button 
                type="button" 
                onClick={handleVerifyOtp}
                disabled={isLoading || !formData.otp}
                className="w-full p-4 bg-[#284D3D] text-white font-bold uppercase tracking-widest border-2 border-black hover:bg-black transition-all duration-300 disabled:bg-gray-400"
              >
                {isLoading ? 'Verifying Code...' : 'Verify OTP & Continue'}
              </button>
            </div>
          )}
        </div>
      )}

      {step === 2 && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-xl">
          <div className="p-4 bg-green-50 text-green-700 border border-green-200 font-bold uppercase tracking-widest text-xs flex justify-between items-center">
            <span>✅ Email Verified: {formData.email}</span>
            <button 
              type="button"
              onClick={() => setStep(1)} 
              className="text-xs text-gray-500 underline uppercase"
            >
              Change Email
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest mb-2">First Name</label>
            <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required className="w-full p-4 border-2 border-black focus:border-[#C5A059] outline-none transition-colors" />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest mb-2">Last Name</label>
            <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required className="w-full p-4 border-2 border-black focus:border-[#C5A059] outline-none transition-colors" />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest mb-2">Mobile Number (Optional)</label>
            <input 
              type="tel" 
              name="mobileNumber" 
              value={formData.mobileNumber} 
              onChange={handleChange} 
              placeholder="10-digit mobile number"
              className="w-full p-4 border-2 border-black focus:border-[#C5A059] outline-none transition-colors"
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className={`w-full p-4 font-bold uppercase tracking-widest transition-all duration-300 ${isLoading ? 'bg-gray-200 cursor-not-allowed' : 'bg-[#284D3D] text-white border-2 border-black hover:bg-black'}`}
          >
            {isLoading ? 'Creating Account...' : 'Complete Registration'}
          </button>
        </form>
      )}
    </div>
  );
}