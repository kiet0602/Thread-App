import User from "../Model/userModel.js";
import jwt from "jsonwebtoken";

const protectRoute = async (req, res, next) => {
  // hàm có async gọi là hàm async
  try {
    // (Lấy) Truy xuất giá trị của cookie tên là jwt truyền cho token
    const token = req.cookies.jwt;
    // kiểm tra giá trị token
    if (!token) return res.status(401).json({ message: "Unauthorized" });
    // xác minh và giải mã JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    //Nếu token hợp lệ, đối tượng decoded sẽ chứa payload của token, bao gồm các thông tin user dựa trên userId (trừ trường password)
    const user = await User.findById(decoded.userId).select("-password"); // await: đợi kết quả của truy vấn trước rồi mới tới lượt(sử dụng trong hàm async)
    //Thông tin user
    req.user = user; // => lấy ID:  user._id
    //Nếu không gọi next(), yêu cầu sẽ bị treo và không tiếp tục được xử lý.
    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.log("Error in checkUser login: " + error.message);
  }
};

export default protectRoute;
