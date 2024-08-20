// Nhập thư viện mongoose
import mongoose from "mongoose";

// Định nghĩa một schema mới cho model Conversation
const conversationSchema = new mongoose.Schema(
  {
    // Trường participants là một mảng chứa các ObjectId tham chiếu tới model User
    // Dùng để xác định các người tham gia trong cuộc hội thoại
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId, // Kiểu dữ liệu là ObjectId
        ref: "User", // Tham chiếu tới model User để tạo liên kết
      },
    ],
    // Trường lastMessage lưu trữ thông tin tin nhắn cuối cùng trong cuộc hội thoại
    lastMessage: {
      // Trường text lưu trữ nội dung của tin nhắn cuối cùng
      // Dùng để chứa văn bản tin nhắn cuối cùng
      text: String,
      // Trường sender lưu trữ ObjectId tham chiếu tới model User
      // Dùng để xác định người gửi của tin nhắn cuối cùng
      sender: {
        type: mongoose.Schema.Types.ObjectId, // Kiểu dữ liệu là ObjectId
        ref: "User", // Tham chiếu tới model User để tạo liên kết
      },
      seen: {
        type: Boolean,
        default: false,
      },
    },
  },
  // Tùy chọn timestamps: true sẽ tự động thêm các trường createdAt và updatedAt
  // createdAt lưu trữ thời gian tạo cuộc hội thoại
  // updatedAt lưu trữ thời gian cập nhật cuộc hội thoại
  { timestamps: true }
);

// Tạo một model Mongoose tên là Conversation sử dụng schema đã định nghĩa ở trên
// Model này sẽ đại diện cho bộ sưu tập conversations trong cơ sở dữ liệu
const Conversation = mongoose.model("Conversation", conversationSchema);

// Xuất model Conversation để các tệp khác có thể nhập và sử dụng
// Giúp các phần khác của ứng dụng có thể tương tác với bộ sưu tập conversations
export default Conversation;
