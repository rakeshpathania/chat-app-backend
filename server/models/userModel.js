import mongoose from "mongoose";

const userSchema = mongoose.Schema(
  {
    id:{
      type: Number
    },
    username: {
      type: String,
    },
    email: {
      type: String,
    },
    password: {
      type: String,
    },
    isAvatarImageSet: {
      type: Boolean,
      default: false,
    },
    avatarImage: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model("users", userSchema);

User.syncIndexes();
