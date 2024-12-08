
const express = require("express");
const { register, login, logout } = require("../controllers/User");
const { createProfile, editProfile, showProfile, showNotifications } = require("../controllers/profile");
const upload = require("../config/multerFile");
const router = express.Router();
const protect = require("../middlewares/authMiddleware");
const handleValidationErrors = require("../middlewares/handelValidationError");
const registerValidation = require("../validation/registerValidators");
const createProfileValidation = require("../validation/profileValidator");
const {
  createPost,
  editPost,
  showPost,
  deletePost,
} = require("../controllers/Post");
const { createComment, editComment } = require("../controllers/Comments");
const postValidator = require("../validation/postValidator");
const {
  validateComment,
  validateEditComment,
} = require("../validation/commentValidator");
const { likePost, dislikePost } = require("../controllers/LikePost");
const { followUser, unfollowUser } = require("../controllers/Follow");
router.route("/").post(registerValidation, handleValidationErrors, register);
router.route("/login").post(login);
router.route("/logout").post(logout);
router
  .route("/createProfile")
  .post(
    protect,
    createProfileValidation,
    handleValidationErrors,
    upload.single("profilepic"),
    createProfile
  );

router
  .route("/editProfile")
  .post(
    protect,
    createProfileValidation,
    handleValidationErrors,
    upload.single("profilepic"),
    editProfile
  );
  router.route("/showProfile").get(protect, showProfile);

router
  .route("/createPost")
  .post(
    protect,
    postValidator,
    handleValidationErrors,
    upload.single("attachments"),
    createPost
  );
router
  .route("/editPost/:post_id")
  .post(
    protect,
    postValidator,
    handleValidationErrors,
    upload.single("attachments"),
    editPost
  );

router.route("/showPost").get(protect, showPost);
router.route("/showNotification").get(protect, showNotifications);

router.route("/deletePost/:post_id").post(protect, deletePost);

router
  .route("/createComment/:post_id")
  .post(protect, validateComment, handleValidationErrors, createComment);

router
  .route("/editComment/:post_id/:comment_id")
  .post(protect, validateEditComment, handleValidationErrors, editComment);

router.route("/likePost/:post_id").post(protect, likePost);
router.route("/dislikePost/:post_id").post(protect, dislikePost);
router.route("/follow/:user_id").post(protect, followUser);
router.route("/unfollow/:user_id").post(protect, unfollowUser);

module.exports = router;
