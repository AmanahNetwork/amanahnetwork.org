import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true, maxlength: 50 },
  lastName: { type: String, required: true, trim: true, maxlength: 50 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  password: { type: String, select: false }, // Never return password in queries by default
  role: { type: String, enum: ['DONOR', 'BENEFICIARY', 'ADMIN'], default: 'DONOR' },
  mobileNumber: { type: String, required: false, trim: true, maxlength: 20 },
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String, select: false },
  failedLoginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date, default: null }
}, { timestamps: true });

UserSchema.pre('save', async function() {
  if (!this.password || !this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

delete mongoose.models.User;
const User = mongoose.model('User', UserSchema);
export default User;