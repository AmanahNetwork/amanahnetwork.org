import { useState } from 'react';
import api from '../api';

export default function TransferAid() {
  const [formData, setFormData] = useState({
    orgName: '',
    address: '',
    ciaNumber: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    accountNumber: '',
    ifscCode: '',
    email: ''
  });
  const verifyBankDetails = async () => {
  if (formData.accountNumber.length > 8 && formData.ifscCode.length === 11) {
    try {
      const response = await api.post('/api/verify-bank', {
        accountNumber: formData.accountNumber,
        ifsc: formData.ifscCode
      });
      if (response.data.valid) {
        alert("Bank account verified successfully!");
      }
    } catch (error) {
      console.error("Verification error:", error);
      alert("Invalid Bank Details. Please check your input.");
    }
  }
};
  const handleTransfer = async () => {
    try {
      // Force current date at the moment of execution
      const payload = {
        ...formData,
        date: new Date().toISOString().split('T')[0]
      };

      const transferEndpoint = '/api/admin/secure-aid-fund-transfer';
      await api.post(transferEndpoint, payload);
      alert("Funds sent and confirmation email triggered!");
    } catch (error) {
      console.error("Transfer error:", error);
      alert(`Transfer failed: ${error.response?.data?.error || error.message}`);
    }
  };

  return (
    <div className="p-10 max-w-2xl mx-auto font-mono">
      <h1 className="text-2xl font-black mb-6">AID DISBURSEMENT PORTAL</h1>
      
      <div className="grid grid-cols-1 gap-4">
        <input placeholder="Receiving Org Name" onChange={(e) => setFormData({...formData, orgName: e.target.value})} className="border-2 p-2" />
        <textarea placeholder="Complete Address" onChange={(e) => setFormData({...formData, address: e.target.value})} className="border-2 p-2" />
        <input placeholder="CIA Number" onChange={(e) => setFormData({...formData, ciaNumber: e.target.value})} className="border-2 p-2" />
<input 
  type="number" 
  min="0" 
  placeholder="Amount" 
  value={formData.amount} // Controlled component
  onChange={(e) => {
    const val = Math.max(0, parseFloat(e.target.value) || 0);
    setFormData({...formData, amount: val});
  }} 
  className="border-2 p-2" 
/> 
<input 
  type="date" 
  value={new Date().toISOString().split('T')[0]} 
  disabled 
  className="border-2 p-2 bg-gray-100 cursor-not-allowed text-gray-500" 
/>
       <input 
  placeholder="Account Number" 
  value={formData.accountNumber}
  onChange={(e) => setFormData({...formData, accountNumber: e.target.value})}
  onBlur={verifyBankDetails} // Verification happens here
  className="border-2 p-2" 
/>
<input 
  placeholder="IFSC Code" 
  value={formData.ifscCode}
  onChange={(e) => setFormData({...formData, ifscCode: e.target.value})}
  onBlur={verifyBankDetails} // Verification happens here
  className="border-2 p-2" 
/>
<input type="email" placeholder="Receiving Org Email" onChange={(e) => setFormData({...formData, email: e.target.value})} className="border-2 p-2" />
        
        <button 
          onClick={handleTransfer} 
          className="bg-black text-white p-4 font-bold hover:bg-green-800 transition"
        >
          EXECUTE SECURE TRANSFER
        </button>
      </div>
    </div>
  );
}