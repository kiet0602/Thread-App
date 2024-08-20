import express from "express";
import dotenv from "dotenv";
import connectDB from "./db/connectDB.js";
import cookieParser from "cookie-parser";
import userRoutes from "./Routes/userRoutes.js";
import postRoutes from "./Routes/postRoutes.js";
import messageRoutes from "./Routes/messageRoutes.js";

//đám mây
import { v2 as cloudinary } from "cloudinary";
import bodyParser from "body-parser";

import { app, server } from "./socket/socket.js";

dotenv.config();
/* vì có sử dụng dotenv nên để dưới dòng config */
connectDB();
/* Khởi tạo ứng dụng Express: const app = express();
khởi tạo một ứng dụng Express mới bằng cách gọi hàm tạo của thư viện Express. 
Sau đó, kết quả được gán cho biến app, là ứng dụng Express chúng ta sẽ làm việc với. */

// const app = express();

/* cài cổng cho server */
const PORT = process.env.PORT || 5000;

//----------------------------------------------------------------------
// đám mây
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
app.use(bodyParser.json({ limit: "50mb" })); // Tăng giới hạn kích thước của JSON
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true })); // Tăng giới hạn kích thước của URL-encoded data

//app.use() được sử dụng để cài đặt các middleware.

//middleware này sẽ giúp bạn trích xuất dữ liệu JSON
app.use(express.json());
//express.urlencoded({ extended: true }): Middleware này được sử dụng để phân tích các yêu cầu HTTP có chứa dữ liệu từ form được gửi dưới dạng application/x-www-form-urlencoded, cho phép sử dụng các đối tượng và mảng dạng phức tạp như một phần của dữ liệu được gửi
app.use(express.urlencoded({ extended: true }));
// /Nó sẽ phân tích dữ liệu từ phần header Cookie của yêu cầu và đặt nó vào req.cookies
app.use(cookieParser());

//Routes
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/messages", messageRoutes);

server.listen(PORT, () =>
  console.log(`Server start at http://localhost:${PORT}`)
);
