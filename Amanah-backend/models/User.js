import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String },
  role: { type: String, enum: ['DONOR', 'BENEFICIARY', 'ADMIN'], default: 'DONOR' },
  mobileNumber: { type: String, required: false, trim: true },
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String }
}, { timestamps: true });

UserSchema.pre('save', async function() {
  if (!this.password || !this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

delete mongoose.models.User;
const User = mongoose.model('User', UserSchema);
export default User;