const ErrorResponse = require("../utils/errorHandler");
const Profile = require("../models/userProfileModel");
const user = require("../models/UserModel");
const Notification=require('../models/Notification')
const createProfile = async (req, res, next) => {
  const {
    affiliation,
    designation,
    fieldOfResearch,
    bio,
    publications,
    awards,
    socialLinks,
  } = req.body;

  const profilePic = req.file ? req.file.filename : "default.jpeg";

  try {
    const createdProfile = await Profile.create({
      userId: req.user,
      profilePic,
      affiliation,
      designation,
      fieldOfResearch,
      bio,
      publications,
      awards,
      socialLinks,
    });
    const userUpdated = await user.findOneAndUpdate(
      { _id: req.user },
      {
        profile_id: createProfile._id,
      }
    );
    res.status(201).json({
      success: true,
      message: "Profile created successfully",
      profile: createdProfile,
    });
  } catch (err) {
    return next(new ErrorResponse(err.message, 500));
  }
};
const showProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.user });
    res.status(200).json({
      success: true,
      message: "Profile successfull",
      profile: profile,
    });
  } catch (err) {
    return next(new ErrorResponse(err.message, 500));
  }
};

const showNotifications=async (req,res,next)=>{
  try{
    const userprofile=await user.findOne({_id:req.user})

    const allNotification=await Notification.find({userId:userprofile.profile_id})
    res.status(200).json({
      success: true,
      message: "All Notification",
      Notifications:allNotification,
    });  
  }catch(err){
    return next(new ErrorResponse(err.message, 500));
  }
 
}
const editProfile = async (req, res, next) => {
  const {
    affiliation,
    designation,
    fieldOfResearch,
    bio,
    publications,
    awards,
    socialLinks,
  } = req.body;

  const profilePic = req.file ? req.file.filename : undefined; // Update only if file is uploaded

  try {
    const updatedData = {
      ...(affiliation && { affiliation }),
      ...(designation && { designation }),
      ...(fieldOfResearch && { fieldOfResearch }),
      ...(bio && { bio }),
      ...(publications && { publications }),
      ...(awards && { awards }),
      ...(socialLinks && { socialLinks }),
      ...(profilePic && { profilePic }),
      updatedAt: new Date(), // Update the timestamp
    };

    const editedProfile = await Profile.findOneAndUpdate(
      { userId: req.user }, // Ensure you're using the correct property for user ID
      { $set: updatedData },
      { new: true } // Return the updated profile
    );

    if (!editedProfile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile edited successfully",
      profile: editedProfile,
    });
  } catch (err) {
    return next(new ErrorResponse(err.message, 500));
  }
};

module.exports = { createProfile, editProfile, showProfile ,showNotifications};
