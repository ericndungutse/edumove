import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const options = { discriminatorKey: 'role', timestamps: true };

// Base User Schema
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: String, required: true },
    password: { type: String, required: true },
  },
  options
);

// Hash Password
userSchema.pre('save', async function (next) {
  // CHECK IF PASSWORD WAS MODIFIED
  // IF NO, Return AND GO OVER
  if (!this.isModified('password')) return next();

  // IF YES HASH THE PASSWORD
  this.password = await bcrypt.hash(this.password, 12);

  next();
});

// Compare Password
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const User = mongoose.model('User', userSchema);

// Transporter Schema
const Transporter = User.discriminator(
  'transporter',
  new mongoose.Schema(
    {
      areaOfOperations: [{ type: String, required: true }],
    },
    options
  )
);

// School Admin Schema
const School = User.discriminator(
  'school',
  new mongoose.Schema(
    {
      district: { type: String, required: true },
      sector: { type: String, required: true },
      cell: { type: String, required: true },
      village: { type: String, required: true },
    },
    options
  )
);

export { User, Transporter, School };
