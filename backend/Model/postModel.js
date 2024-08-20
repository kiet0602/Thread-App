import mongoose from "mongoose";

const postSchema = mongoose.Schema(
  {
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Thêm dấu nháy đơn xung quanh 'User'
      //tham chiếu đến model User để biết ai post
    },
    text: {
      type: String,
      maxLength: 500,
    },
    img: {
      type: String,
    },
    likes: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      default: [],
    },
    replies: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User", // Thêm dấu nháy đơn xung quanh 'User'
          required: true,
        },
        text: {
          type: String,
          required: true,
        },
        userProfilePic: {
          type: String,
        },
        username: {
          type: String,
        },
      },
    ], // Đảm bảo dấu ngoặc vuông đóng cho trường replies
  },
  { timestamps: true } // Thêm dấu phẩy và chỉnh sửa timestamp thành timestamps
);

const Post = mongoose.model("Post", postSchema);

export default Post;
