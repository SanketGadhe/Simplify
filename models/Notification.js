const mongoose=require('mongoose')
const notificationSchema =  mongoose.Schema({
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String, // "Invitation", "Request", etc.
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    relatedWorkspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
    },
    status: {
      type: String,
      enum: ['Unread', 'Read'],
      default: 'Unread',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  });
  module.exports = mongoose.model('Notification', notificationSchema);
  