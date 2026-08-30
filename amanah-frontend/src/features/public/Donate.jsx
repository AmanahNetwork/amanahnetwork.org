import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';

export default function Donate() {
  const [donorName, setDonorName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [amount, setAmount] = useState('');
  const [agreed, setAgreed] = useState(false);

  // OTP Verification state
  const [otpSent, setOtpSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleSendOtp = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const cleanEmail = (donorEmail || '').trim().toLowerCase();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      setMessage({ type: 'error', text: 'Please enter a valid email address before requesting an OTP.' });
      return;
    }

    setDonorEmail(cleanEmail);
    setIsSendingOtp(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await api.post('/api/auth/send-otp', { email: cleanEmail });
      setOtpSent(true);
      if (res.data?.debugOtp) {
        setOtp(res.data.debugOtp);
        setMessage({ 
          type: 'success', 
          text: `OTP generated (${res.data.debugOtp}). Please enter it below to verify your email.` 
        });
      } else {
        setMessage({ 
          type: 'success', 
          text: 'OTP sent to your email address! Please check your inbox (and spam/junk folder).' 
        });
      }
    } catch (err) {
      console.error("Send OTP Error:", err);
      const errMsg = err.response?.data?.error || err.message || 'Failed to send verification OTP. Please try again.';
      setMessage({ type: 'error', text: errMsg });
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      setMessage({ type: 'error', text: 'Please enter the 6-digit OTP.' });
      return;
    }

    setIsVerifyingOtp(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await api.post('/api/auth/verify-otp', { email: donorEmail.trim(), otp: otp.trim() });
      if (res.data.verified) {
        setIsEmailVerified(true);
        setMessage({ type: 'success', text: 'Email successfully verified!' });
      } else {
        setMessage({ type: 'error', text: 'Invalid or expired OTP code.' });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: err.response?.data?.error || 'Invalid OTP verification code.' });
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handlePayment = async (donationAmount) => {
    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) {
      alert("Payment gateway failed to load. Please check your internet connection.");
      return;
    }

    const { data: order } = await api.post('/api/payment/create-order', {
      amount: donationAmount,
      donorEmail,
      mobileNumber,
      donorName,
      projectTitle: "General Donation"
    });

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: "INR",
      order_id: order.id,
      handler: async (response) => {
        try {
          const verifyRes = await api.post('/api/payment/verify', {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            donorEmail,
            amount: donationAmount,
            donorName,
            mobileNumber,
            projectTitle: "General Donation"
          });
          if (verifyRes.data.status === 'success') {
            setMessage({ type: 'success', text: 'Payment successful and verified!' });
          } else {
            setMessage({ type: 'error', text: 'Payment verification failed.' });
          }
        } catch (err) {
          console.error("Verification error:", err);
          const detail = err.response?.data?.error || err.message || "Verification error.";
          setMessage({ type: 'error', text: `Verification error: ${detail}` });
        } finally {
          setIsLoading(false);
        }
      },
      modal: {
        ondismiss: () => setIsLoading(false)
      },
      prefill: { name: donorName, email: donorEmail, contact: mobileNumber }
    };

    try {
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response) => {
        setIsLoading(false);
        setMessage({ type: 'error', text: `Payment Failed: ${response.error.description}` });
      });
      rzp.open();
    } catch (error) {
      console.error("Razorpay error:", error);
      setIsLoading(false);
      setMessage({ type: 'error', text: 'Failed to initiate payment.' });
    }
  };

  const handleDonation = async (e) => {
    e.preventDefault();

    if (!isEmailVerified) {
      setMessage({ type: 'error', text: 'Please verify your email address via OTP before proceeding.' });
      return;
    }

    const cleanPhone = (mobileNumber || '').trim().replace(/[\s\-\+]/g, '');
    const phoneRegex = /^\d{10,15}$/;
    if (!mobileNumber || !phoneRegex.test(cleanPhone)) {
      setMessage({ type: 'error', text: 'Please enter a valid mobile number (10 to 15 digits).' });
      return;
    }

    if (Number(amount) <= 0) {
      setMessage({ type: 'error', text: 'Please enter a valid donation amount.' });
      return;
    }

    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await handlePayment(Number(amount));
    } catch {
      setIsLoading(false);
      setMessage({ type: 'error', text: "Payment network error." });
    }
  };

  return (
    <div className="py-24 px-6 md:px-12 lg:px-24">
      <header className="mb-12 text-left">
        <div className="mb-6">
          <span className="text-[#284D3D] font-mono tracking-[0.2em] uppercase text-xs font-bold">Secure</span>
          <span className="text-[#C5A059] font-mono tracking-[0.2em] uppercase text-xs font-bold ml-2">Portal</span>
        </div>
        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-[0.9] mb-6">
          <span className="text-[#284D3D]">Unified</span> 
          <span className="text-[#C5A059] ml-3">Transaction Engine.</span>
        </h2>
        <p className="text-lg text-gray-600 max-w-xl">Your contribution directly drives the high-transparency foundation network.</p>
      </header>

      {message.text && (
        <div className={`p-4 mb-8 font-bold uppercase tracking-widest text-xs border max-w-xl ${message.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
          <span className="font-mono mr-2">{message.type === 'success' ? '[SUCCESS]' : '[ERROR]'}</span> {message.text}
        </div>
      )}

      <form onSubmit={handleDonation} className="space-y-6 max-w-xl">
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest mb-2">Full Name</label>
          <input 
            type="text" 
            value={donorName} 
            onChange={(e) => setDonorName(e.target.value)} 
            required 
            placeholder="Your Full Name"
            className="w-full p-4 border-2 border-black focus:border-[#C5A059] outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-widest mb-2">Mobile Number</label>
          <input 
            type="tel" 
            value={mobileNumber} 
            onChange={(e) => setMobileNumber(e.target.value.replace(/[^0-9]/g, ''))}
            placeholder="Enter 10-digit mobile number"
            maxLength="10"
            required 
            className="w-full p-4 border-2 border-black focus:border-[#C5A059] outline-none transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-widest mb-2">Email Address</label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input 
              type="email" 
              value={donorEmail} 
              onChange={(e) => {
                setDonorEmail(e.target.value);
                setIsEmailVerified(false);
                setOtpSent(false);
              }} 
              required 
              disabled={isEmailVerified}
              placeholder="you@domain.com"
              className="w-full p-4 border-2 border-black focus:border-[#C5A059] outline-none transition-colors disabled:bg-gray-100"
            />
            {!isEmailVerified && (
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={isSendingOtp || !donorEmail}
                className="px-6 py-4 bg-[#284D3D] text-white font-bold uppercase tracking-widest border-2 border-black hover:bg-black transition-all whitespace-nowrap disabled:bg-gray-400"
              >
                {isSendingOtp ? 'Sending...' : otpSent ? 'Resend OTP' : 'Send OTP'}
              </button>
            )}
          </div>
        </div>

        {/* OTP Input Section when OTP is sent & email not yet verified */}
        {otpSent && !isEmailVerified && (
          <div className="bg-gray-50 border-2 border-black p-4 space-y-3">
            <label className="block text-xs font-bold uppercase tracking-widest">Enter 6-Digit OTP Sent to Your Email</label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input 
                type="text" 
                value={otp} 
                onChange={(e) => setOtp(e.target.value)} 
                placeholder="123456" 
                maxLength="6"
                className="w-full p-3 border-2 border-black outline-none font-mono"
              />
              <button
                type="button"
                onClick={handleVerifyOtp}
                disabled={isVerifyingOtp || !otp}
                className="px-6 py-3 bg-[#C5A059] text-white font-bold uppercase tracking-widest border-2 border-black hover:bg-black transition-all whitespace-nowrap disabled:bg-gray-400"
              >
                {isVerifyingOtp ? 'Verifying...' : 'Verify OTP'}
              </button>
            </div>
          </div>
        )}

        {/* Email Verification Status Badge */}
        {isEmailVerified && (
          <div className="bg-green-50 border border-green-200 text-green-700 p-3 text-xs font-bold uppercase tracking-wider">
            [VERIFIED] Email Verified: {donorEmail}
          </div>
        )}

        <div>
          <label className="block text-xs font-bold uppercase tracking-widest mb-2">Donation Amount (INR)</label>
          <input 
            type="number" 
            value={amount} 
            onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ''))}
            min="1" 
            required 
            placeholder="Enter amount"
            className="w-full p-4 border-2 border-black focus:border-[#C5A059] outline-none transition-colors"
          />
        </div>

        <div className="flex items-center space-x-3 py-2">
          <input 
            type="checkbox" 
            id="terms" 
            checked={agreed} 
            onChange={(e) => setAgreed(e.target.checked)} 
            required 
            className="w-5 h-5 accent-[#284D3D]"
          />
          <label htmlFor="terms" className="text-xs font-bold uppercase tracking-widest cursor-pointer">
            I agree to the 
            <Link to="/terms" target="_blank" rel="noopener noreferrer" className="text-[#C5A059] underline ml-1">Terms & Conditions</Link>
          </label>
        </div>

        <button 
          type="submit" 
          disabled={isLoading || !agreed || !isEmailVerified} 
          className="w-full p-4 bg-[#284D3D] text-white font-bold uppercase tracking-widest border-2 border-black hover:bg-black transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Processing securely...' : !isEmailVerified ? 'Verify Email via OTP First' : 'Authorize Donation'}
        </button>
      </form>
    </div>
  );
}