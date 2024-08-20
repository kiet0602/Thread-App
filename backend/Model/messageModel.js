// Nhập thư viện mongoose
import mongoose from "mongoose";

// Định nghĩa một schema mới cho model Message
const messageSchema = new mongoose.Schema(
  {
    // Trường conversationId lưu trữ một ObjectId tham chiếu tới model Conversation
    // Dùng để xác định cuộc hội thoại mà tin nhắn này thuộc về
    conversationId: {
      type: mongoose.Schema.Types.ObjectId, // Kiểu dữ liệu là ObjectId
      ref: "Conversation", // Tham chiếu tới model Conversation để tạo liên kết
    },
    // Trường sender lưu trữ một ObjectId tham chiếu tới model User
    // Dùng để xác định người gửi tin nhắn
    sender: {
      type: mongoose.Schema.Types.ObjectId, // Kiểu dữ liệu là ObjectId
      ref: "User", // Tham chiếu tới model User để tạo liên kết
    },
    // Trường text lưu trữ nội dung của tin nhắn
    // Dùng để chứa văn bản tin nhắn
    text: String,
    seen: {
      type: Boolean,
      default: false,
    },
    img: {
      type: String,
      default: " ",
    },
  },

  // Tùy chọn timestamps: true sẽ tự động thêm các trường createdAt và updatedAt
  // createdAt lưu trữ thời gian tạo tin nhắn
  // updatedAt lưu trữ thời gian cập nhật tin nhắn
  { timestamps: true }
);

// Tạo một model Mongoose tên là Message sử dụng schema đã định nghĩa ở trên
// Model này sẽ đại diện cho bộ sưu tập messages trong cơ sở dữ liệu
const Message = mongoose.model("Message", messageSchema);

// Xuất model Message để các tệp khác có thể nhập và sử dụng
// Giúp các phần khác của ứng dụng có thể tương tác với bộ sưu tập messages
export default Message;
