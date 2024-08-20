// Import thư viện Server từ Socket.io và http, express
import { Server } from "socket.io";
import http from "http";
import express from "express";
import Message from "../Model/messageModel.js";
import Conversation from "../Model/conversationModel.js";

const app = express(); // Khởi tạo ứng dụng Express, giúp xử lý các yêu cầu HTTP

const server = http.createServer(app); // Tạo máy chủ HTTP sử dụng ứng dụng Express, cho phép xử lý các yêu cầu HTTP và WebSocket

// Tạo một đối tượng Server từ Socket.io, với cấu hình CORS (Cross-Origin Resource Sharing)
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Cho phép kết nối từ địa chỉ http://localhost:3000
    methods: ["GET", "POST"], // Các phương thức HTTP được phép là GET và POST
  },
});

export const getRecipientSocketId = (recipientId) => {
  return userSocketMap[recipientId];
};

const userSocketMap = {}; // userId : socketId
// Tạo một đối tượng `userSocketMap` để lưu trữ ánh xạ giữa userId và socketId

io.on("connection", (socket) => {
  // Khi có một kết nối mới, hàm callback này được gọi với đối tượng `socket`
  console.log("user connected", socket.id); // In ra ID của socket mới kết nối

  const userId = socket.handshake.query.userId; // Lấy userId từ truy vấn của kết nối WebSocket

  if (userId != "undefined") {
    // Kiểm tra nếu userId không phải là "undefined"
    userSocketMap[userId] = socket.id; // Lưu trữ socketId theo userId trong userSocketMap
  }

  // Gửi danh sách các userId hiện có trong userSocketMap tới tất cả các kết nối WebSocket
  io.on("connection", (socket) => {
    console.log("user connected", socket.id);

    const userId = socket.handshake.query.userId;
    if (userId !== "undefined") {
      userSocketMap[userId] = socket.id;
    }

    io.emit("getOnlineUser", Object.keys(userSocketMap));

    socket.on("markMessageAsSeen", async ({ conversationId, userId }) => {
      try {
        await Message.updateMany(
          { conversationId: conversationId, seen: false },
          { $set: { seen: true } }
        );
        await Conversation.updateOne(
          { _id: conversationId },
          { $set: { "lastMessage.seen": true } }
        );
        io.to(userSocketMap[userId]).emit("messageSeen", { conversationId });
      } catch (error) {
        console.log(error);
      }
    });

    socket.on("disconnect", () => {
      console.log("user disconnected", socket.id);
      // Loại bỏ userId khỏi userSocketMap khi người dùng ngắt kết nối
      for (const [id, sid] of Object.entries(userSocketMap)) {
        if (sid === socket.id) {
          delete userSocketMap[id];
          break;
        }
      }
      io.emit("getOnlineUsers", Object.keys(userSocketMap)); // chú ý tên
    });
  });
});

export { io, server, app }; // Xuất đối tượng `io`, `server`, và `app` để các module khác có thể sử dụng
