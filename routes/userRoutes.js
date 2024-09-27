import express from 'express';
import { createUser, selectLockerSize, saveChoice, dropAndSendOtp, verifyDropOtp, saveFacialScanData, saveMpin, verifyPickUpMobile,  getPickUpDetails, verifyFacialScan, verifyMpin, getLockerStatus} from '../controllers/userController.js';

const router = express.Router();

// Route to create user
router.post('/createUser', createUser);


// Route to select locker size
router.post('/locker', selectLockerSize);

// Route for saving choice (Drop or Pick-Up)
router.post('/choice', saveChoice); 


// Send OTP for drop feature
router.post('/drop/sendotp', dropAndSendOtp);

// Verify OTP for drop
router.post('/drop/verifyotp', verifyDropOtp);

//Facial scan
router.post('/drop/facialscan', saveFacialScanData);

//mpin 
router.post('/drop/mpin', saveMpin); 

// Route for verifying mobile number during Pick-Up
router.post('/pickup/verify', verifyPickUpMobile); 

//Route for get mobileNumber
router.get('/pickup-details/:mobileNumber', getPickUpDetails);


// Verify face during pick-up
router.post('/pickup/verify/face', verifyFacialScan); 

// Verify M-PIN if face fails
router.post('/pickup/verify/mpin', verifyMpin); 

//locker status
router.get('/locker-status/:mobileNumber', getLockerStatus);

export default router;
