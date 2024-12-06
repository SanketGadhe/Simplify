const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const PostSchema = new Schema({
  
  authorId: {
    type: Schema.Types.ObjectId,
    ref: "User", // Reference to User schema
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true, // Removes leading/trailing whitespace
  },
  content: {
    type: String,
    required: true,
  },
  attachments: {
    type: [String], // Array of URLs
    default: [],
  },
  tags: {
    type: [String],
    default: [],
  },
  visibility: {
    type: String,
    enum: ["Public", "Private", "Connections Only"], // Allowed values
    default: "Public",
  },
  likes: {
    type: [mongoose.Schema.Types.ObjectId], // Array of user IDs
    ref: "user", // Reference to User schema
    default: [],
  },
  comments: [
    {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      default: new mongoose.Types.ObjectId(),
    },
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Reference to User schema
        required: true,
      },
      content: {
        type: String,
        required: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  updatedAt: {
    type: Date,
    default: null,
  },
});

module.exports = model("post", PostSchema);
