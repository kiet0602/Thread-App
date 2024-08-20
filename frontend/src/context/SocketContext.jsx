// Import các thư viện cần thiết
import { createContext, useContext, useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import io from "socket.io-client";

// Tạo ngữ cảnh SocketContext
const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

// Tạo component SocketContextProvider để cung cấp ngữ cảnh cho các component con
export const SocketContextProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);

  // Lấy giá trị người dùng từ Recoil state
  const user = useRecoilValue(userAtom);

  // Sử dụng useEffect để thiết lập kết nối Socket.io khi component được render hoặc khi user.id thay đổi
  useEffect(() => {
    // Tạo kết nối socket tới máy chủ với URL và query chứa userId
    const newSocket = io("http://localhost:4000", {
      query: {
        userId: user?.id, // Truyền userId nếu có
      },
    });

    // Cập nhật state socket
    setSocket(newSocket);

    // Thiết lập sự kiện 'getOnlineUser' trên newSocket
    newSocket.on("getOnlineUser", (users) => {
      // Thêm log để kiểm tra dữ liệu nhận được
      setOnlineUsers(users);
    });

    // Hàm dọn dẹp: đóng kết nối socket khi component bị huỷ hoặc user.id thay đổi
    return () => newSocket.close();
  }, [user?.id]); // Chạy effect khi user.id thay đổi

  // Trả về component SocketContext.Provider để cung cấp giá trị ngữ cảnh cho các component con
  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};
