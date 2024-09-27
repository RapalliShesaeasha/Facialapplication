import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
    },
    mobileNumber: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
    },
  lockerSize: { type: String, enum: ['MEDIUM', 'LARGE', 'SMALL'], default: null }, // New field
  choice: { type: String },
  dropInfo: {
    mobileNumber: { type: String },
    otp: { type: String },
    facialScanData: { type: String }, // Store facial scan data here
    mpin: { type: String }, // Store M-PIN here
    pickUpDetails: { type: String }, // Store pick-up details here

  },
  lockerStatus: { type: Boolean, default: true }, // true for active, false for inactive
});

const User = mongoose.model('User', userSchema);

export default User;
