import { useState } from 'react';
import api from '../api';

export default function SecureTransfer() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [creds, setCreds] = useState({ email: '', password: '' });
  const [transfer, setTransfer] = useState({ recipientName: '', amount: '', note: '' });

  const handleLogin = async () => {
    try {
      // We check credentials against the server
      await api.post('/api/auth/login', creds); 
      setIsLoggedIn(true); // Only show the payment form after success
    } catch {
      alert("Invalid Email or Password");
    }
  };

  return (
    <div className="p-8 max-w-lg mx-auto">
      {!isLoggedIn ? (
        <div className="border p-4">
          <h2 className="font-bold mb-4">AGENT LOGIN</h2>
          <input placeholder="Email" onChange={(e) => setCreds({...creds, email: e.target.value})} />
          <input type="password" placeholder="Password" onChange={(e) => setCreds({...creds, password: e.target.value})} />
          <button onClick={handleLogin}>LOGIN TO PROCEED</button>
        </div>
      ) : (
        <div className="border p-4">
          <h2 className="font-bold mb-4">PAYMENT PORTAL</h2>
          <input placeholder="Recipient" onChange={(e) => setTransfer({...transfer, recipientName: e.target.value})} />
          <input type="number" placeholder="Amount" onChange={(e) => setTransfer({...transfer, amount: e.target.value})} />
          <button onClick={async () => {
             await api.post(import.meta.env.VITE_SECRET_TRANSFER_PATH, { ...creds, transferData: transfer });
             alert("Payment Sent");
          }}>EXECUTE PAYMENT</button>
        </div>
      )}
    </div>
  );
}