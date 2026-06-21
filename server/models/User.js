import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, minlength: 6 },
  googleId: { type: String, unique: true, sparse: true },
  avatar:   { type: String, default: '' },
  avatarPublicId: { type: String, default: '' },
  role:     { type: String, enum: ['admin', 'member', 'viewer'], default: 'member' },
  resetPasswordToken:   { type: String },
  resetPasswordExpires: { type: Date },
  isEmailVerified: { type: Boolean, default: false },
  emailVerificationToken: { type: String },
  emailVerificationExpires: { type: Date },
}, { timestamps: true });

userSchema.pre('save', function () {
  if (!this.isModified('password') || !this.password) return;
  return bcrypt.hash(this.password, 12).then((hashed) => {
    this.password = hashed;
  });
});

userSchema.methods.comparePassword = function (candidatePassword) {
  if (!this.password) return Promise.resolve(false);
  return bcrypt.compare(candidatePassword, this.password);
};


userSchema.methods.generateResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.resetPasswordExpires = Date.now() + 15 * 60 * 1000; 

  return resetToken; 
};
userSchema.methods.generateEmailVerificationToken = function () {
  const verificationToken = crypto.randomBytes(32).toString('hex');

  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');

  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

  return verificationToken;
};
export default mongoose.model('User', userSchema);