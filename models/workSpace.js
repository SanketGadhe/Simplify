const mongoose = require('mongoose');

const workspaceSchema = new mongoose.Schema({
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'UserProfile',
        required:true
    },
  title: {
    type: String,
    required: true,
  },
  overview: {
    type: String,
    required: true,
  },
  mode: {
    type: String,
    enum: ['Public', 'Invite-Only'], // Public or Individual Collaboration
    required: true,
  },
  roles: [
     { type: String, required: true }, // E.g., Writer, Reviewer
   
  ],
  joinRequests: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to user collection
        required: true,
      },
      message: {
        type: String,
      },
      status: {
        type: String,
        enum: ['Pending', 'Accepted', 'Rejected'], // Status of request
        default: 'Pending',
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  invitations: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      username: {
        type: String,
        required: true,
      },
      status: {
        type: String,
        enum: ['Pending', 'Accepted', 'Rejected'], // Status of invitation
        default: 'Pending',
      },
      role: {
        type: String, // Role assigned during invitation
      },
    },
  ],
  collaborators: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      role: {
        type: String, // Role assigned after accepting invitation/join request
        required: true,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    
  },
});

module.exports = mongoose.model('Workspace', workspaceSchema);
