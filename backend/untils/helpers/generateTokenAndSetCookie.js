import jwt from "jsonwebtoken";

/* nhận 2 tham số UserId(ID của người dùng mà token được tạo cho họ) và phản hồi res */
const generateTokenAndSetCookie = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    /* thời gian hết hạn */
    expiresIn: "15d",
  });
  /* jwt là tên của cookie, và token là giá trị đã tạo trước đó  */
  res.cookie("jwt", token, {
    httpOnly: true,
    maxAge: 15 * 24 * 60 * 60 * 1000,
    sameSize: "strict",
  });
  return token;
};

export default generateTokenAndSetCookie;
