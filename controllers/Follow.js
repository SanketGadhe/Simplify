const UserProfile = require("../models/userProfileModel");

const followUser = async (req, res, next) => {
  try {
    const userId = req.user; // Assuming req.user._id contains the authenticated user's ID
    const followId = req.params.user_id;
    if (userId === followId) {
      return res.status(400).json({
        success: false,
        message: "You cannot follow yourself",
      });
    }

    // Find the user profile of the current user
    const userProfile = await UserProfile.findOne({userId:userId});
    if (!userProfile) {
      return res.status(404).json({
        success: false,
        message: "Your profile was not found",
      });
    }

    // Find the user profile of the user to follow
    const followedUserProfile = await UserProfile.findOne({userId:followId});
    if (!followedUserProfile) {
      return res.status(404).json({
        success: false,
        message: "The user you are trying to follow does not exist",
      });
    }

    // Check if the user is already following the target user
    if (followedUserProfile.followers.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: "You are already following this user",
      });
    }

    // Add the current user to the target user's followers array
    followedUserProfile.followers.push(userId);
    await followedUserProfile.save();

    // Add the target user to the current user's following array
    userProfile.following.push(followId);
    await userProfile.save();

    return res.status(200).json({
      success: true,
      message: "User followed successfully",
    });
  } catch (error) {
    // Pass the error to the centralized error handler (if available)
    return next(error);
  }
};

const unfollowUser = async (req, res, next) => {
  try {
    const userId = req.user; // Assuming req.user._id contains the authenticated user's ID
    const unfollowId = req.params.user_id;

    if (userId === unfollowId) {
      return res.status(400).json({
        success: false,
        message: "You cannot unfollow yourself",
      });
    }

    // Find the user profile of the current user
    const userProfile = await UserProfile.findOne({userId});
    if (!userProfile) {
      return res.status(404).json({
        success: false,
        message: "Your profile was not found",
      });
    }

    // Find the user profile of the user to unfollow
    const unfollowedUserProfile = await UserProfile.findOne({userId:unfollowId});
    if (!unfollowedUserProfile) {
      return res.status(404).json({
        success: false,
        message: "The user you are trying to unfollow does not exist",
      });
    }

    // Check if the user is actually following the target user
    if (!unfollowedUserProfile.followers.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: "You are not following this user",
      });
    }

    // Remove the current user from the target user's followers array
    unfollowedUserProfile.followers.pull(userId);
    await unfollowedUserProfile.save();

    // Remove the target user from the current user's following array
    userProfile.following.pull(unfollowId);
    await userProfile.save();

    return res.status(200).json({
      success: true,
      message: "User unfollowed successfully",
    });
  } catch (error) {
    // Pass the error to the centralized error handler (if available)
    return next(error);
  }
};

module.exports = { followUser, unfollowUser };
