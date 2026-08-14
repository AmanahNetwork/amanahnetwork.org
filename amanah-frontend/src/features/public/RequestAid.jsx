import { useState } from 'react';
import api from '../../api';

export default function RequestAid() {
  const [email, setEmail] = useState('');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [justificationQuery, setJustificationQuery] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  const handleRequestSubmit = async (e) => {
    e.preventDefault();

    // Logic: Prevent negative or zero funding requests
    if (Number(amount) <= 0) {
      setStatusMessage("❌ Invalid amount. Funding request must be greater than $0.");
      return;
    }

    setStatusMessage('');

    try {
      await api.post('/api/disbursements/request', {
        beneficiaryEmail: email,
        projectTitle: title,
        amountRequested: Number(amount),
        justificationQuery
      });
      
      setStatusMessage(`✅ Allocation proposal logged cleanly for board analysis.`);
      setEmail('');
      setTitle('');
      setAmount('');
      setJustificationQuery('');
    } catch (err) {
      console.error(err);
      setStatusMessage("❌ Registration failure. Verify parameter requirements.");
    }
  };

  return (
    <div className="py-24 px-6 md:px-12 lg:px-24">
      <header className="mb-12 text-left">
        <div className="mb-6 flex gap-2">
          <span className="text-[#284D3D] font-mono tracking-[0.2em] uppercase text-xs">Beneficiary</span>
          <span className="text-[#C5A059] font-mono tracking-[0.2em] uppercase text-xs">Portal</span>
        </div>
        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-[0.9] mb-6">
          Allocation<br /> Request.
        </h2>
        <p className="text-lg text-gray-600 max-w-xl">Submit clear technical metrics regarding your funding needs below.</p>
      </header>

      {statusMessage && (
        <div className={`p-4 mb-8 font-bold uppercase tracking-widest text-xs border max-w-xl ${statusMessage.includes('✅') ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
          {statusMessage}
        </div>
      )}

      <form onSubmit={handleRequestSubmit} className="space-y-8 max-w-xl">
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest mb-2">Registered Email Address</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full p-4 border-2 border-black focus:border-[#C5A059] outline-none transition-colors" />
        </div>
        
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest mb-2">Initiative Project Title</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full p-4 border-2 border-black focus:border-[#C5A059] outline-none transition-colors" />
        </div>
        
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest mb-2">Target Funding Required (INR)</label>
          <input 
            type="number" 
            value={amount} 
            onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ''))}
            min="1" 
            required 
            className="w-full p-4 border-2 border-black focus:border-[#C5A059] outline-none transition-colors"
          />
        </div>
        
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest mb-2">Detailed Request Query & Impact Justification</label>
          <textarea 
            value={justificationQuery} 
            onChange={(e) => setJustificationQuery(e.target.value)} 
            required 
            rows="4"
            placeholder="Describe explicitly how these reserve elements will be deployed..."
            className="w-full p-4 border-2 border-black focus:border-[#C5A059] outline-none transition-colors resize-none"
          />
        </div>
        
        <button type="submit" className="w-full p-4 bg-[#C5A059] text-white font-bold uppercase tracking-widest border-2 border-black hover:bg-black transition-all duration-300">
          File Allocation Request
        </button>
      </form>
    </div>
  );
}