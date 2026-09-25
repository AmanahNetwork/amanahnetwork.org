import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const AuthorizedAgentSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  password: { type: String, required: true, select: false },
  
  // KYC Details
  kyc: {
    type: Object,
    default: {}
  },

  // Permissions (RBAC)
  permissions: { type: [String], default: ['TRANSFER'] },
  
  isVerified: { type: Boolean, default: false },
  failedLoginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date, default: null },
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