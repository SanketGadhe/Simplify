const mongoose = require("mongoose");

const userProfileSchema = mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
  profilePic: { type: String, default: "default.jpeg" },
  affiliation: { type: String, required: true },
  designation: { type: String, required: true },
  fieldOfResearch: { type: [String], required: true },
  bio: { type: String, required: true },
  publications: [
    {
      title: { type: String, required: true },
      link: { type: String, required: true },
      year: { type: Number, required: true },
    },
  ],
  awards: [
    {
      title: { type: String, required: true },
      year: { type: Number, required: true },
    },
  ],
  socialLinks: {
    linkedIn: { type: String, default: null },
    researchGate: { type: String, default: null },
    orcid: { type: String, default: null },
  },
  posts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "post",
      default: null,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  following:[{type: mongoose.Schema.Types.ObjectId,
    ref: "userProfile",
    default: null,
  }],
  followers:[{type: mongoose.Schema.Types.ObjectId,
    ref: "userProfile",
    default: null,
  }],
  updatedAt: {
    type: Date,
    default: null,
  },
});

module.exports = mongoose.model("UserProfile", userProfileSchema);
