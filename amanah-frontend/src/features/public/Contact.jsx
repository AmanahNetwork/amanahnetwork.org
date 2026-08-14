import { useForm, ValidationError } from '@formspree/react';

export default function Contact() {
  const [state, handleSubmit] = useForm("YOUR_FORM_ID");

  if (state.succeeded) {
    return (
      <div className="py-24 px-6 md:px-12 lg:px-24">
        <h2 className="text-4xl font-black uppercase tracking-tighter">Application Received</h2>
        <p className="text-gray-600 mt-4">Thank you for your interest. Our team will review your credentials and be in touch soon.</p>
      </div>
    );
  }

  return (
    // Outer container keeps consistent site padding
    <div className="py-24 px-6 md:px-12 lg:px-24">
      
      {/* Header aligned to the left edge */}
      <header className="mb-12 text-left">
        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-6">
          Let's <span className="text-[#C5A059]">Talk.</span>
        </h2>
        <p className="text-lg text-gray-600 leading-relaxed max-w-2xl">
          We are currently expanding our reach and seeking dedicated individuals to join our mission as associates. 
          If you share our vision, please provide your details below.
        </p>
      </header>
      
      {/* Form constrained to a max-width and aligned left */}
      <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
        
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest mb-2">Full Name</label>
          <input type="text" name="name" required className="w-full p-4 border-2 border-black focus:border-[#284D3D] outline-none transition-colors" />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-widest mb-2">Mobile Number</label>
          <input type="tel" name="mobile" required className="w-full p-4 border-2 border-black focus:border-[#284D3D] outline-none transition-colors" />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-widest mb-2">Email Address</label>
          <input type="email" name="email" required className="w-full p-4 border-2 border-black focus:border-[#284D3D] outline-none transition-colors" />
          <ValidationError prefix="Email" field="email" errors={state.errors} />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-widest mb-2">Why do you want to join?</label>
          <textarea 
            name="message" 
            required 
            rows="4" 
            className="w-full p-4 border-2 border-black focus:border-[#284D3D] outline-none transition-colors" 
          />
          <ValidationError prefix="Message" field="message" errors={state.errors} />
        </div>

        <button 
          type="submit" 
          disabled={state.submitting}
          className="px-10 py-4 bg-[#C5A059] text-white font-bold uppercase tracking-widest border-2 border-black hover:bg-black transition-all duration-300"
        >
          Submit Application
        </button>
      </form>
    </div>
  );
}