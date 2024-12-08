const Workspace = require("../models/workSpace");
const User = require("../models/UserModel");
const ErrorResponse = require("../utils/errorHandler");
const Notification = require("../models/Notification");
const mongoose = require("mongoose");
const workSpace = require("../models/workSpace");

const sendNotification = async ({
  users,
  type,
  message,
  relatedWorkspaceId,
}) => {
  try {
    const notifications = users.map((user) => ({
      userId: user.profile_id || user.userId,
      type,
      message,
      relatedWorkspaceId,
    }));

    await Notification.insertMany(notifications); // Batch insert for performance
  } catch (err) {
    console.error("Failed to send notifications:", err.message);
    throw new Error("Notification error");
  }
};

const createWorkspace = async (req, res, next) => {
  const { title, overview, roles, mode, invitation } = req.body;

  try {
    const inviter = await User.findById(req.user);
    if (!inviter) {
      return next(new ErrorResponse("User not found", 404));
    }

    let invitations = [];
    if (mode === "Invite-Only" && invitation?.length > 0) {
      const usernames = invitation.map((invite) => invite.username);
      const users = await User.find({ userName: { $in: usernames } }).exec();

      const usersMap = new Map(users.map((user) => [user.userName, user]));

      invitations = invitation.map((invite) => {
        const userRecord = usersMap.get(invite.username);
        if (!userRecord) {
          throw new ErrorResponse(`User ${invite.username} not found`, 404);
        }
        return {
          userId: userRecord.profile_id,
          username: invite.username,
          status: "Pending",
          role: invite.role,
        };
      });
    }

    const createdWorkspace = await Workspace.create({
      title,
      owner: req.user,
      overview,
      roles,
      mode,
      invitations: invitations.length > 0 ? invitations : undefined,
    });

    if (mode === "Invite-Only" && invitations.length > 0) {
      await sendNotification({
        users: invitations.map((inv) => ({ profile_id: inv.userId })),
        type: "Invitation",
        message: `${inviter.name} has invited you to join the workspace: ${title}.`,
        relatedWorkspaceId: createdWorkspace._id,
      });
    }
    return res.status(200).json({
      success: true,
      message: "Workspace created successfully",
      workspace: createdWorkspace,
    });
  } catch (err) {
    return next(
      new ErrorResponse(err.message || "Failed to create workspace", 500)
    );
  }
};

const editWorkspace = async (req, res, next) => {
  const { workspaceId } = req.params; // Get workspaceId from request params
  const { title, overview, roles, mode, invitation } = req.body;

  try {
    // Ensure workspaceId is a valid ObjectId (24 hex characters)
    if (!mongoose.Types.ObjectId.isValid(workspaceId)) {
      return next(new ErrorResponse("Invalid workspace ID", 400));
    }

    // Fetch the workspace from the database
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return next(new ErrorResponse("Workspace not found", 404));
    }

    let isUpdated = false;

    // 1. Update Title
    if (title && title !== workspace.title) {
      workspace.title = title.trim();
      isUpdated = true;
    }

    // 2. Update Overview
    if (overview && overview !== workspace.overview) {
      workspace.overview = overview.trim();
      isUpdated = true;
    }

    // 3. Update Roles (only if roles are changed)
    if (roles && JSON.stringify(roles) !== JSON.stringify(workspace.roles)) {
      workspace.roles = roles;
      isUpdated = true;
    }

    // 4. Handle Mode Change (Public/Invite-Only)
    if (mode && mode !== workspace.mode) {
      // If the mode changes to Public, handle cancellation of invitations
      if (mode === "Public" && workspace.mode === "Invite-Only") {
        // Cancel all invitations
        const canceledInvitations = workspace.invitations;

        // Notify invited users that their invitation is canceled
        const canceledUsers = canceledInvitations.map((invite) => ({
          profile_id: invite.userId, // Assuming userId is a profile_id in the invitation
        }));
        await sendNotification({
          users: canceledUsers,
          type: "Workspace Update",
          message: `Your invitation to the workspace "${workspace.title}" has been canceled as it is now public.`,
          relatedWorkspaceId: workspaceId,
        });

        // Clear invitations
        workspace.invitations = [];
      }

      // If the mode changes to Invite-Only, handle invitation updates
      if (mode === "Invite-Only" && workspace.mode === "Public") {
        // Clear existing invitations since the workspace is switching to Invite-Only
        workspace.invitations = [];

        // Add new invitations if provided in the request body
        if (invitation && invitation.length > 0) {
          const usernames = invitation.map((invite) => invite.username);
          const users = await User.find({
            userName: { $in: usernames },
          }).exec();

          const usersMap = new Map(users.map((user) => [user.userName, user]));

          // Send invitations and notifications to new invitees
          workspace.invitations = invitation.map((invite) => {
            const userRecord = usersMap.get(invite.username);
            if (!userRecord) {
              throw new ErrorResponse(`User ${invite.username} not found`, 404);
            }

            // New invite
            return {
              userId: userRecord.profile_id,
              username: invite.username,
              status: "Pending",
              role: invite.role,
            };
          });

          // Notify the new invitees about their invitation and role
          const newInvitees = workspace.invitations.map((invite) => ({
            profile_id: invite.userId,
          }));

          await sendNotification({
            users: newInvitees,
            type: "New Invitation",
            message: `You have been invited to join the workspace ${workspace.title}.`,
            relatedWorkspaceId: workspaceId,
          });
        }
      }

      // Update mode
      workspace.mode = mode;
      isUpdated = true;
    }

    if (
      workspace.mode === "Invite-Only" &&
      Array.isArray(invitation) &&
      invitation.length > 0
    ) {
      let roleChanged = false;
      const updatedInvites = []; // Track unique role updates for notifications

      // Check for role changes and update roles
      workspace.invitations.forEach((invite) => {
        const matchingInvitation = invitation.find(
          (newInvite) => newInvite.username === invite.username
        );

        if (matchingInvitation && invite.role !== matchingInvitation.role) {
          invite.role = matchingInvitation.role; // Update role
          roleChanged = true;

          // Ensure the user is added only once to updatedInvites
          if (
            !updatedInvites.some((entry) => entry.username === invite.username)
          ) {
            updatedInvites.push({
              userId: invite.userId,
              username: invite.username,
              role: invite.role,
            });
          }
        }
      });

      // If any roles were updated
      if (roleChanged) {
        // Save changes to the database
        await workspace.save();
        isUpdated = true;

        // Send notifications for updated roles
        if (updatedInvites.length > 0) {
          await sendNotification({
            users: updatedInvites,
            type: "Role Change",
            message: `Your role in the workspace "${workspace.title}" has been updated.`,
            relatedWorkspaceId: workspace._id,
          });

          console.log("Role changes saved and notifications sent.");
        }
      } else {
        console.log("No role changes detected.");
      }
    }

    // 6. Handle adding new invitations/removed invitation when mode changes to "Invite-Only"
    if (
      workspace.mode === "Invite-Only" &&
      Array.isArray(invitation) &&
      invitation.length > 0
    ) {
      const existingInvitations = workspace.invitations;

      // Determine removed users
      const removedUsers = existingInvitations.filter(
        (invite) =>
          !invitation.some(
            (newInvite) =>
              newInvite.username === invite.username &&
              newInvite.role === invite.role
          )
      );

      if (removedUsers.length > 0) {
        // Remove invitations and send notifications for removed users
        workspace.invitations = existingInvitations.filter(
          (invite) =>
            !removedUsers.some(
              (removed) =>
                removed.username === invite.username &&
                removed.role === invite.role
            )
        );

        await sendNotification({
          users: removedUsers,
          type: "Role Change",
          message: `Your invitation to workspace "${workspace.title}" has been canceled.`,
          relatedWorkspaceId: workspace._id,
        });

        isUpdated = true;
      }

      // Determine added users
      const addedUsers = invitation.filter(
        (newInvite) =>
          !existingInvitations.some(
            (invite) =>
              invite.username === newInvite.username &&
              invite.role === newInvite.role
          )
      );

      if (addedUsers.length > 0) {
        // Retrieve user details and update invitations
        const newInvitations = await Promise.all(
          addedUsers.map(async (newInvite) => {
            const user = await User.findOne({ userName: newInvite.username });
            console.log(newInvite);
            return {
              userId: user.profile_id,
              username: newInvite.username,
              role: newInvite.role,
            };
          })
        );

        workspace.invitations.push(...newInvitations);

        await sendNotification({
          users: newInvitations,
          type: "Invitation",
          message: `You have been invited to join the workspace "${workspace.title}".`,
          relatedWorkspaceId: workspace._id,
        });

        isUpdated = true;
      }
    }

    // Save workspace only if any field was updated
    if (isUpdated) {
      await workspace.save();
      return res.status(200).json({
        success: true,
        message: "Workspace updated successfully",
        workspace,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "No changes detected in the workspace data",
      });
    }
  } catch (err) {
    return next(
      new ErrorResponse(err.message || "Failed to update workspace", 500)
    );
  }
};
const deleteWorkspace = async (req, res, next) => {
  const { workspaceId } = req.params;

  try {
    // Find and delete the workspace
    const workspace = await Workspace.findByIdAndDelete(workspaceId);

    // Handle case where workspace is not found
    if (!workspace) {
      return next(new ErrorResponse("Workspace not found", 404));
    }

    // Check if there are users to notify about the deletion
    if (workspace.invitations?.length > 0) {
      const userIds = workspace.invitations.map((inv) => inv.userId);

      // Fetch user details for notifications
      const usersToNotify = await User.find({ profile_id: { $in: userIds } });

      // Send notifications if users are found
      if (usersToNotify.length > 0) {
        const notificationPayload = usersToNotify.map((user) => ({
          profile_id: user._id,
        }));

        await sendNotification({
          users: notificationPayload,
          type: "Deletion",
          message: `The workspace "${workspace.title}" has been deleted.`,
          relatedWorkspaceId: workspace._id,
        });
      }
    }

    // Return a standardized success response
    res.status(200).json({
      success: true,
      data: null,
      message: "Workspace deleted successfully.",
    });
  } catch (error) {
    // Pass errors to the centralized error handler
    next(new ErrorResponse(error.message || "An error occurred while deleting the workspace", 500));
  }
};

const acceptInvitation = async (req, res, next) => {
  const { workspaceId } = req.params;

  try {
    // Retrieve the user's profile_id
    const user = await User.findById(req.user);
    if (!user) {
      return next(new ErrorResponse("User not found", 404));
    }

    const userId = user.profile_id;

    // Find the workspace and ensure it exists
    const invitedWorkspace = await Workspace.findById(workspaceId);
    if (!invitedWorkspace) {
      return next(new ErrorResponse("Workspace not found", 404));
    }

    // Update the invitation status and add the user to collaborators
    let invitationFound = false;

    invitedWorkspace.invitations = invitedWorkspace.invitations.map((invite) => {
      if (invite.userId === userId) {
        invitationFound = true;
        invite.status = "Accepted";
        invitedWorkspace.collaborators.push({ userId, role: invite.role });
      }
      return invite;
    });

    // If no matching invitation is found, throw an error
    if (!invitationFound) {
      return next(new ErrorResponse("No invitation found for this user", 400));
    }

    // Save changes to the workspace
    await invitedWorkspace.save();

    // Respond with a success message
    res.status(200).json({
      success: true,
      message: "You have accepted the invitation.",
    });
  } catch (error) {
    next(new ErrorResponse(error.message || "An error occurred while accepting the invitation", 500));
  }
};

const rejectInvitation = async (req, res, next) => {
  const { workspaceId } = req.params;

  try {
    // Retrieve the user's profile_id
    const user = await User.findById(req.user);
    if (!user) {
      return next(new ErrorResponse("User not found", 404));
    }

    const userId = user.profile_id;

    // Find the workspace and ensure it exists
    const invitedWorkspace = await Workspace.findById(workspaceId);
    if (!invitedWorkspace) {
      return next(new ErrorResponse("Workspace not found", 404));
    }

    // Update the invitation status
    let invitationFound = false;

    invitedWorkspace.invitations = invitedWorkspace.invitations.map((invite) => {
      if (invite.userId === userId) {
        invitationFound = true;
        invite.status = "Rejected";
      }
      return invite;
    });

    // If no matching invitation is found, throw an error
    if (!invitationFound) {
      return next(new ErrorResponse("No invitation found for this user", 400));
    }

    // Save changes to the workspace
    await invitedWorkspace.save();

    // Respond with a success message
    res.status(200).json({
      success: true,
      message: "You have rejected the invitation.",
    });
  } catch (error) {
    next(new ErrorResponse(error.message || "An error occurred while rejecting the invitation", 500));
  }
};

module.exports = { createWorkspace, editWorkspace, deleteWorkspace,acceptInvitation,rejectInvitation };
