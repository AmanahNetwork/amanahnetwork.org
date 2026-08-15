import { useState } from 'react';
import api from '../../api';

export default function Donate() {
  const [donorEmail, setDonorEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [donorName, setDonorName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [agreed, setAgreed] = useState(false);
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

  const handlePayment = async (donationAmount) => {
    // 1. Ensure script is loaded FIRST
    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) {
      alert("Payment gateway failed to load. Please check your connection.");
      return;
    }

    // 2. Call backend to get order details
    const { data: order } = await api.post('/api/payment/create-order', {
      amount: donationAmount,
      donorEmail,
      mobileNumber,
      donorName,
      projectTitle: "General Donation"
    });

    // 3. Setup Razorpay options
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID, // Use your env variable here!
      amount: order.amount,
      currency: "INR",
      order_id: order.id,
      handler: async (response) => {
        try {
          console.log("Response received from Razorpay:", response); // CHECK THIS IN CONSOLE
          const verifyRes = await api.post('/api/payment/verify', {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            donorEmail,
            amount: donationAmount,
            donorName: donorName,
            mobileNumber: mobileNumber,
            projectTitle: "General Donation"
          });
          if (verifyRes.data.status === 'success')
            setMessage({ type: 'success', text: 'Payment successful and verified!' });
          else
            setMessage({ type: 'error', text: 'Payment verification failed.' });
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

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!donorEmail || !emailRegex.test(donorEmail.trim())) {
      setMessage({ type: 'error', text: 'Please enter a valid email address.' });
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
      setMessage({ 
        type: 'error', 
        text: "Payment network error." 
      });
    }
  };


  return (
    <div className="py-24 px-6 md:px-12 lg:px-24">
      <header className="mb-12 text-left">
       <div className="mb-6">
        <span className="text-[#284D3D] font-mono tracking-[0.2em] uppercase text-xs">Secure</span>
        <span className="text-[#C5A059] font-mono tracking-[0.2em] uppercase text-xs ml-2">Portal</span>
       </div>
        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-[0.9] mb-6">
          <span className="text-[#284D3D]">Unified</span> 
          <span className="text-[#C5A059] ml-3">Transaction Engine.</span>
        </h2>
        <p className="text-lg text-gray-600 max-w-xl">Your contribution directly drives the high-transparency foundation network.</p>
      </header>

      {message.text && (
        <div className={`p-4 mb-8 font-bold uppercase tracking-widest text-xs border max-w-xl ${message.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
          {message.type === 'success' ? '✅' : '❌'} {message.text}
        </div>
      )}

      <form onSubmit={handleDonation} className="space-y-8 max-w-xl">
        <div>
        <label className="block text-xs font-bold uppercase tracking-widest mb-2">Full Name</label>
        <input 
        type="text" 
        value={donorName} 
       onChange={(e) => setDonorName(e.target.value)} 
       required 
       className="w-full p-4 border-2 border-black focus:border-[#C5A059] outline-none"/>
      </div>
      <div>
  <label className="block text-xs font-bold uppercase tracking-widest mb-2">Mobile Number</label>
  <input 
    type="tel" 
    value={mobileNumber} 
    onChange={(e) => setMobileNumber(e.target.value.replace(/[^0-9]/g, ''))}
    placeholder="Enter 10-digit number"
    maxLength="10"
    required 
    className="w-full p-4 border-2 border-black focus:border-[#C5A059] outline-none transition-colors"
  />
</div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest mb-2">Confirm Your Registered Email Address</label>
          <input 
            type="email" 
            value={donorEmail} 
            onChange={(e) => setDonorEmail(e.target.value)} 
            required 
            className="w-full p-4 border-2 border-black focus:border-[#C5A059] outline-none transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-widest mb-2">Donation Amount (INR)</label>
          <input 
            type="number" 
            value={amount} 
            onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ''))}
            min="1" 
            required 
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
            <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-[#C5A059] underline ml-1">Audit Terms</a>
          </label>
        </div>
        <button 
          type="submit" 
          disabled={isLoading || !agreed} 
          className="w-full p-4 bg-[#284D3D] text-white font-bold uppercase tracking-widest border-2 border-black hover:bg-black transition-all duration-300 disabled:bg-gray-400"
        >
          {isLoading ? 'Processing securely...' : 'Authorize Donation'}
        </button>
      </form>
    </div>
  );
}