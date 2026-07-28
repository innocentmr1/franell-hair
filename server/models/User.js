const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 8 },
    isAdmin: { type: Boolean, default: false },
    phone: { type: String, default: '' },
    shippingAddress: {
      street:  { type: String, default: '' },
      city:    { type: String, default: '' },
      state:   { type: String, default: '' },
      zip:     { type: String, default: '' },
      country: { type: String, default: '' },
    },
    preferences: {
      newsletter:   { type: Boolean, default: false },
      orderUpdates: { type: Boolean, default: true },
    },
    failedLoginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date, default: null },
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null },
    // Default true so existing accounts (created before this feature) are
    // unaffected — only fresh registrations explicitly set this to false.
    isEmailVerified: { type: Boolean, default: true },
    emailVerificationOTP: { type: String, default: null },
    emailVerificationOTPExpires: { type: Date, default: null },
    // Email-based MFA, required only for admin accounts after password check.
    mfaOTP: { type: String, default: null },
    mfaOTPExpires: { type: Date, default: null },
  },
  { timestamps: true }
);

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.matchPassword = function (entered) {
  return bcrypt.compare(entered, this.password);
};

module.exports = mongoose.model('User', userSchema);
