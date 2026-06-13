import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, minlength: 6 },
  googleId: { type: String, unique: true, sparse: true },
  avatar:   { type: String, default: '' },
  role:     { type: String, enum: ['admin', 'member', 'viewer'], default: 'member' },
}, { timestamps: true });

// ← No async/await, use promise instead
userSchema.pre('save', function () {
  if (!this.isModified('password') || !this.password) return;
  return bcrypt.hash(this.password, 12).then((hashed) => {
    this.password = hashed;
  });
});

userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);