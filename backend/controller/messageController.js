import Conversation from "../Model/conversationModel.js";
import Message from "../Model/messageModel.js";
import { getRecipientSocketId, io } from "../socket/socket.js";
import { v2 as cloudinary } from "cloudinary";

const sendMessage = async (req, res) => {
  try {
    const { recipientId, message } = req.body; //recipientId: Id người nhận tin nhắn
    let { img } = req.body;
    const senderId = req.user._id;

    let conversation = await Conversation.findOne({
      // conversation để lưu trữ kết quả tìm kiếm.
      //participants: Trường này trong tài liệu Conversation
      participants: { $all: [senderId, recipientId] }, // $all : tìm các element trong mảng participants
    });
    if (!conversation) {
      // tạo ra Conversation mới
      conversation = new Conversation({
        participants: [senderId, recipientId], // xác định: mảng ai gửi vs ai nhận
        lastMessage: {
          text: message, // nội dung tin nhắn cuối cùng
          sender: senderId, // xác định:  người gửi
        },
      });
      await conversation.save();
    }

    if (img) {
      const uploadResponse = await cloudinary.uploader.upload(img);
      img = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      conversationId: conversation._id,
      sender: senderId,
      text: message,
      img: img || "",
    });

    await Promise.all([
      newMessage.save(),
      conversation.updateOne({
        lastMessage: {
          text: message,
          sender: senderId,
        },
      }),
    ]);
    // gửi thông báo cho 1 user
    const recipientSocketId = getRecipientSocketId(recipientId);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit("newMessage", newMessage);
    }
    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMessages = async (req, res) => {
  const { otherUserId } = req.params; // Người dùng có id trên URL (vào trang người khác)
  const userId = req.user._id; // Người dùng hiện tại( tài khoảng: đang đăng nhập)
  try {
    const conversation = await Conversation.findOne({
      participants: { $all: [userId, otherUserId] },
    });
    if (!conversation) {
      // Return để ngăn chặn việc tiếp tục xử lý sau khi gửi phản hồi
      return res.status(404).json({ message: "Not found conversation" });
    }

    const messages = await Message.find({
      conversationId: conversation._id,
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getConversation = async (req, res) => {
  const userId = req.user._id;

  try {
    const conversations = await Conversation.find({
      participants: userId,
    }).populate({
      path: "participants",
      select: "username profilePic",
    });

    // xóa người dùng hiện tại đang đăng nhạp ra khỏi mảng participants
    conversations.forEach((conversation) => {
      conversation.participants = conversation.participants.filter(
        (participant) => participant._id.toString() !== userId.toString()
      );
    });

    res.status(200).json(conversations);
  } catch (error) {
    res.status(500).json({ error: "getConversation" });
  }
};

export { sendMessage, getMessages, getConversation };
