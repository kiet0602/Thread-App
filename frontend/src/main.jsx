// Nhập các thư viện và module cần thiết
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

import { ChakraProvider } from "@chakra-ui/react";
import { mode } from "@chakra-ui/theme-tools";
import { extendTheme } from "@chakra-ui/theme-utils";
import { ColorModeScript } from "@chakra-ui/color-mode";
//Chuyển hướng
import { BrowserRouter } from "react-router-dom";
// Sử dụng nhiều lần
import { RecoilRoot } from "recoil";
// Thông báo trên toàn ứng dụng
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { SocketContextProvider } from "./context/SocketContext.jsx";

// Định nghĩa các kiểu toàn cục cho ứng dụng
const styles = {
  global: (props) => ({
    body: {
      // Đặt màu chữ dựa trên chế độ màu hiện tại
      color: mode("gray.800", "whiteAlpha.900")(props),
      // Đặt màu nền dựa trên chế độ màu hiện tại
      bg: mode("gray.100", "#101010")(props),
    },
  }),
};

// Định nghĩa cấu hình cho chủ đề Chakra UI
const config = {
  // Đặt chế độ màu ban đầu là "dark"
  initialColorMode: "dark",
  // Bật tính năng chế độ màu của hệ thống
  useSystemColorMode: true,
};

// Định nghĩa các màu sắc tùy chỉnh cho bảng màu "gray"
const colors = {
  gray: {
    light: "#616161",
    dark: "#1e1e1e",
  },
};

// Tạo một chủ đề Chakra UI tùy chỉnh bằng cách mở rộng chủ đề mặc định
const theme = extendTheme({ config, styles, colors });

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RecoilRoot>
      <BrowserRouter>
        {/* Cung cấp ngữ cảnh Chakra UI cho toàn bộ ứng dụng */}
        <ChakraProvider theme={theme}>
          <ColorModeScript initialColorMode={theme.config.initialColorMode} />
          <SocketContextProvider>
            {/* Render thành phần chính App */}
            <App />
          </SocketContextProvider>
          <ToastContainer />
        </ChakraProvider>
      </BrowserRouter>
    </RecoilRoot>
  </React.StrictMode>
);
