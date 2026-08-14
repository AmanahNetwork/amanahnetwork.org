import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const AuthorizedAgentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  
  // KYC Details (Optional Object)
  kyc: {
    type: Object,
    default: {}
  },

  // Permissions
  permissions: { type: [String], default: ['TRANSFER'] },
  
  isVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// Hash password before saving
AuthorizedAgentSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

delete mongoose.models.AuthorizedAgent;
const AuthorizedAgent = mongoose.model('AuthorizedAgent', AuthorizedAgentSchema);
export default AuthorizedAgent;