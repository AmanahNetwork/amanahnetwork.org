import { useState } from 'react';
import api from '../../api';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (formData.name.trim().length > 25) {
      setError("Full Name cannot exceed 25 characters.");
      return;
    }

    if (formData.message.trim().length > 500) {
      setError("Why do you want to join section cannot exceed 500 characters.");
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!formData.email || !emailRegex.test(formData.email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/api/contact', formData);
      setIsSubmitted(true);
    } catch (err) {
      console.error("Contact Form Error:", err);
      setError(err.response?.data?.error || "Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="py-24 px-6 md:px-12 lg:px-24 font-mono">
        <h2 className="text-4xl font-black uppercase tracking-tighter text-[#284D3D]">Application Received</h2>
        <p className="text-gray-600 mt-4 max-w-xl">
          Thank you for your interest. All your details have been submitted and sent to our team. We will review your submission and be in touch soon.
        </p>
        <button 
          onClick={() => { setIsSubmitted(false); setFormData({ name: '', mobile: '', email: '', message: '' }); }}
          className="mt-8 px-6 py-3 bg-black text-white font-bold uppercase tracking-widest text-xs hover:bg-[#284D3D] transition-colors"
        >
          Submit Another Application
        </button>
      </div>
    );
  }

  return (
    <div className="py-24 px-6 md:px-12 lg:px-24">
      <header className="mb-12 text-left">
        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-6">
          Let's <span className="text-[#C5A059]">Talk.</span>
        </h2>
        <p className="text-lg text-gray-600 leading-relaxed max-w-2xl">
          We are currently expanding our reach and seeking dedicated individuals to join our mission as associates. 
          If you share our vision, please provide your details below.
        </p>
      </header>
      
      {error && (
        <div className="mb-6 p-4 border-2 border-red-500 bg-red-50 text-red-700 text-sm font-mono max-w-xl">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 max-w-xl font-mono">
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-xs font-bold uppercase tracking-widest">Full Name</label>
            <span className={`text-[10px] font-mono ${formData.name.length >= 25 ? 'text-red-500 font-bold' : 'text-gray-500'}`}>
              {formData.name.length}/25
            </span>
          </div>
          <input 
            type="text" 
            name="name" 
            maxLength={25}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value.slice(0, 25) })}
            required 
            placeholder="Your Full Name (Max 25 characters)"
            className="w-full p-4 border-2 border-black focus:border-[#284D3D] outline-none transition-colors" 
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-widest mb-2">Mobile Number</label>
          <input 
            type="tel" 
            name="mobile" 
            value={formData.mobile}
            onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
            required 
            placeholder="Mobile Number"
            className="w-full p-4 border-2 border-black focus:border-[#284D3D] outline-none transition-colors" 
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-widest mb-2">Email Address</label>
          <input 
            type="email" 
            name="email" 
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required 
            placeholder="you@domain.com"
            className="w-full p-4 border-2 border-black focus:border-[#284D3D] outline-none transition-colors" 
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-xs font-bold uppercase tracking-widest">Why do you want to join?</label>
            <span className={`text-[10px] font-mono ${formData.message.length >= 500 ? 'text-red-500 font-bold' : 'text-gray-500'}`}>
              {formData.message.length}/500
            </span>
          </div>
          <textarea 
            name="message" 
            maxLength={500}
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value.slice(0, 500) })}
            required 
            rows="4" 
            placeholder="Tell us about your background and motivation (Max 500 characters)..."
            className="w-full p-4 border-2 border-black focus:border-[#284D3D] outline-none transition-colors" 
          />
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting}
          className="px-10 py-4 bg-[#C5A059] text-white font-bold uppercase tracking-widest border-2 border-black hover:bg-black transition-all duration-300 disabled:opacity-50"
        >
          {isSubmitting ? "Submitting..." : "Submit Application"}
        </button>
      </form>
    </div>
  );
}