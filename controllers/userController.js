import User from '../models/userModel.js';
import axios from 'axios';
import { createCanvas, loadImage } from 'canvas';

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Create User without OTP
export const createUser = async (req, res) => {
  const { name, mobileNumber, email } = req.body;

  try {
    // Check if user already exists
    let user = await User.findOne({ mobileNumber });
    if (user) {
      return res.status(400).json({ message: 'User with this mobile number already exists' });
    }

    // Create a new user
    user = new User({
      name,
      mobileNumber,
      email,
    });

    await user.save();
    res.status(201).json({ message: 'User created successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create user', error });
  }
};

// Select Locker Size
export const selectLockerSize = async (req, res) => {
  const { mobileNumber, lockerSize } = req.body;

  try {
    const user = await User.findOne({ mobileNumber });
    if (!user || !user.otpVerified) {
      return res.status(400).json({ message: 'User not verified or does not exist' });
    }

    user.lockerSize = lockerSize;
    await user.save();

    res.status(200).json({ message: 'Locker size selected successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to select locker size', error });
  }
};

// Save user's choice (Drop or Pick-Up)
export const saveChoice = async (req, res) => {
    const { mobileNumber, choice } = req.body;
  
    try {
      // Find the user by mobile number
      let user = await User.findOne({ mobileNumber });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Check the user's choice and update the locker status accordingly
      if (choice === 'drop') {
        user.lockerStatus = false; // Set locker to inactive
      } else if (choice === 'pick-up') {
        user.lockerStatus = true; // Set locker to active
      } else {
        return res.status(400).json({ message: 'Invalid choice' });
      }
  
      // Save the user's choice and locker status
      user.choice = choice;
      await user.save();
  
      res.status(200).json({ message: `${choice} option selected successfully`, lockerStatus: user.lockerStatus });
    } catch (error) {
      res.status(500).json({ message: 'Failed to save choice', error });
    }
  };
  

// Send OTP for Drop feature
export const dropAndSendOtp = async (req, res) => {
    const { mobileNumber } = req.body;
    const otp = generateOTP();
  
    try {
      // Find the user by mobile number and update the drop OTP
      let user = await User.findOne({ mobileNumber });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      user.dropInfo.mobileNumber = mobileNumber;
      user.dropInfo.otp = otp;
      await user.save();
  
      // Send OTP via Textlocal
      const message = `Your OTP for login to Zibomo Sprint Safe is ${otp}%0APlease do not share this OTP with anyone.%0ARegards,%0AAppprotech.`;
  
      // Send request to Textlocal
      const response = await axios.post('https://api.textlocal.in/send/', null, {
        params: {
          apikey: process.env.TEXTLOCAL_API_KEY,
          numbers: mobileNumber,
          message,
          sender: 'spsafe',
        },
      });
  
      res.status(200).json({ message: 'OTP sent successfully for drop', response: response.data });
    } catch (error) {
      res.status(500).json({ message: 'Failed to send OTP for drop', error });
    }
  };
  
  // Verify Drop OTP
  export const verifyDropOtp = async (req, res) => {
    const { mobileNumber, otp } = req.body;
  
    try {
      // Find the user by mobile number and check OTP
      let user = await User.findOne({ 'dropInfo.mobileNumber': mobileNumber });
      if (!user || user.dropInfo.otp !== otp) {
        return res.status(400).json({ message: 'Invalid OTP or mobile number' });
      }
  
      res.status(200).json({ message: 'OTP verified successfully for drop' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to verify OTP for drop', error });
    }
  };

// Save Facial Scan Data
export const saveFacialScanData = async (req, res) => {
    const { mobileNumber, facialScanData } = req.body;
  
    try {
      // Find the user by mobile number
      let user = await User.findOne({ 'dropInfo.mobileNumber': mobileNumber });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Save facial scan data under dropInfo
      user.dropInfo.facialScanData = facialScanData;
      await user.save();
  
      res.status(200).json({ message: 'Facial scan data saved successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to save facial scan data', error });
    }
  };
  
  // Save M-PIN
export const saveMpin = async (req, res) => {
    const { mobileNumber, mpin } = req.body;
  
    try {
      // Find the user by mobile number
      let user = await User.findOne({ 'dropInfo.mobileNumber': mobileNumber });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Save M-PIN under dropInfo
      user.dropInfo.mpin = mpin;
      await user.save();
  
      res.status(200).json({ message: 'M-PIN saved successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to save M-PIN', error });
    }
  };
  
// Verify mobile number for Pick-Up and save additional data
export const verifyPickUpMobile = async (req, res) => {
    const { mobileNumber, pickUpDetails } = req.body; // Accept additional pick-up data
  
    try {
      // Find the user by checking the mobile number in dropInfo
      let user = await User.findOne({ 'dropInfo.mobileNumber': mobileNumber });
      if (!user) {
        return res.status(404).json({ message: 'Mobile number does not match drop records' });
      }
  
      // Mobile number matches, proceed to save pick-up details
      user.dropInfo.pickUpDetails = pickUpDetails; // Save the pick-up details
  
      await user.save(); // Save the updated user data to MongoDB
  
      // Return success message
      res.status(200).json({ message: 'Mobile number matches drop records, pick-up details saved successfully', user });
    } catch (error) {
      res.status(500).json({ message: 'Failed to verify mobile number and save pick-up details', error });
    }
  };

// Fetch pick-up details for the next page
export const getPickUpDetails = async (req, res) => {
    const { mobileNumber } = req.params; // Get mobile number from the request params
  
    try {
      // Find user by mobile number
      const user = await User.findOne({ 'dropInfo.mobileNumber': mobileNumber });
      if (!user) {
        return res.status(404).json({ message: 'No user found with this mobile number' });
      }
  
      // Send pick-up details
      res.status(200).json({
        mobileNumber: user.dropInfo.mobileNumber,
        pickUpDetails: user.dropInfo.pickUpDetails,
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to retrieve pick-up details', error });
    }
  };
  

// Function to compare two images and return the match percentage
const compareImages = async (base64Image1, base64Image2) => {
    try {
      const img1 = await loadImage(`data:image/jpeg;base64,${base64Image1}`);
      const img2 = await loadImage(`data:image/jpeg;base64,${base64Image2}`);
  
      const canvas = createCanvas(img1.width, img1.height);
      const ctx = canvas.getContext('2d');
      
      ctx.drawImage(img1, 0, 0);
      const imgData1 = ctx.getImageData(0, 0, img1.width, img1.height).data;
  
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img2, 0, 0);
      const imgData2 = ctx.getImageData(0, 0, img2.width, img2.height).data;
  
      let totalPixels = img1.width * img1.height;
      let diffPixels = 0;
  
      for (let i = 0; i < imgData1.length; i += 4) {
        if (
          imgData1[i] !== imgData2[i] || // Red channel
          imgData1[i + 1] !== imgData2[i + 1] || // Green channel
          imgData1[i + 2] !== imgData2[i + 2] // Blue channel
        ) {
          diffPixels++;
        }
      }
  
      const matchPercentage = ((totalPixels - diffPixels) / totalPixels) * 100;
      return matchPercentage;
    } catch (error) {
      console.error('Error comparing images:', error);
      return 0; // If there's an error, return 0% match
    }
  };
  
  // Handle facial scan verification
  export const verifyFacialScan = async (req, res) => {
    const { mobileNumber, facialScanData } = req.body;
  
    try {
      // Find the user by mobile number (from dropInfo)
      let user = await User.findOne({ 'dropInfo.mobileNumber': mobileNumber });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Compare the current facial scan with the stored facialScanData
      const matchPercentage = await compareImages(user.dropInfo.facialScanData, facialScanData);
  
      if (matchPercentage >= 85) {
        return res.status(200).json({ message: 'Face matches, proceed to next step' });
      } else {
        return res.status(400).json({ message: 'Face does not match, try with M-PIN' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Failed to verify facial scan', error });
    }
  };
  
  // Handle M-PIN verification if face scan fails
  export const verifyMpin = async (req, res) => {
    const { mobileNumber, mpin } = req.body;
  
    try {
      // Find the user by mobile number (from dropInfo)
      let user = await User.findOne({ 'dropInfo.mobileNumber': mobileNumber });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Compare the provided M-PIN with the stored M-PIN
      if (user.dropInfo.mpin === mpin) {
        return res.status(200).json({ message: 'M-PIN matches, proceed to next step' });
      } else {
        return res.status(400).json({ message: 'M-PIN does not match' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Failed to verify M-PIN', error });
    }
  };

  // Get Locker Status
export const getLockerStatus = async (req, res) => {
    const { mobileNumber } = req.params;
  
    try {
      // Find the user by mobile number
      const user = await User.findOne({ mobileNumber });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Return the locker status
      res.status(200).json({ lockerStatus: user.lockerStatus });
    } catch (error) {
      res.status(500).json({ message: 'Failed to retrieve locker status', error });
    }
  };
  