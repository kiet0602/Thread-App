import mongoose from "mongoose";

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      /* unique: true -> là duy nhất. */
    },
    password: {
      type: String,
      minLength: 6,
      required: true,
    },
    profilePic: {
      type: String,
      /* không có giá trị => chuỗi rỗng */
      default: "",
    },
    followers: {
      /* [String]-> mảng chứa chuỗi. */
      type: [String],
      default: [],
    },
    following: {
      type: [String],
      /* không có giá trị => mảng rỗng */
      default: [],
    },
    bio: {
      type: String,
      default: "",
    },
    isFrozen: {
      type: Boolean,
      default: false,
    },
  },
  /* Mongoose sẽ tự động thêm các trường createdAt và updatedAt khi "timestamps: true" */
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
