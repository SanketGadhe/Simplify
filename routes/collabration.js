const express=require('express')
const { createWorkspace, editWorkspace, deleteWorkspace, acceptInvitation, rejectInvitation } = require("../controllers/WorkspaceTask");
const protect = require("../middlewares/authMiddleware");
const router = express.Router();
const handleValidationErrors = require("../middlewares/handelValidationError");
const workspaceValidator = require("../validation/workspaceValidator");

router
  .route("/createWorkspace")
  .post(protect, workspaceValidator, handleValidationErrors, createWorkspace);
router
  .route("/editWorkspace/:workspaceId")
  .post(protect, workspaceValidator, handleValidationErrors, editWorkspace);
router
  .route("/deleteWorkspace/:workspaceId")
  .post(protect, deleteWorkspace);
router
  .route("/acceptWorkspace/:workspaceId")
  .post(protect,  acceptInvitation);
router
  .route("/rejectWorkspace/:workspaceId")
  .post(protect,  rejectInvitation);

  module.exports=router;