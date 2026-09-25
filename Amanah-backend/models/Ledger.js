import mongoose from 'mongoose'; // Use ES Module import
// Define the schema using the variable name 'ledgerSchema'
const ledgerSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  actionType: { 
    type: String, 
    enum: ['RECEIVED', 'SPENT'], 
    required: true 
  },
  target: { type: String, required: true },
  amount: { type: Number, required: true },
  transactionId: { type: String, required: true, index: true }
});
ledgerSchema.index({ timestamp: -1 });

// Export using the SAME variable name 'ledgerSchema'
const ledger = mongoose.models.Ledger || mongoose.model('Ledger', ledgerSchema);
export default ledger;