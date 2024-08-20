import {
  Button,
  Flex,
  Image,
  Link,
  useColorMode,
  useColorModeValue,
} from "@chakra-ui/react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import userAtom from "../atoms/userAtom";
import { Link as RouterLink } from "react-router-dom";
import { AiFillHome } from "react-icons/ai";
import { LuLogOut } from "react-icons/lu";
import { RxAvatar } from "react-icons/rx";
import useLogOut from "../Hooks/useLogOut";
import authScreenAtom from "../atoms/authAtom";
import { BsChatQuote } from "react-icons/bs";
import { MdOutlineSettings } from "react-icons/md";

const Header = () => {
  const { colorMode, toggleColorMode } = useColorMode(); // Sử dụng hook useColorMode để lấy giá trị colorMode và toggleColorMode
  const user = useRecoilValue(userAtom);
  const setAuthScreen = useSetRecoilState(authScreenAtom);
  const handleLogOut = useLogOut();

  return (
    <Flex justifyContent={"space-between"} mt={6} mb={12}>
      {user && (
        <Link as={RouterLink} to="/">
          <AiFillHome size={24} />
        </Link>
      )}
      {!user && (
        <Link
          as={RouterLink}
          to={"/auth"}
          onClick={() => setAuthScreen("login")}
        >
          LogIn
        </Link>
      )}

      <Image
        cursor={"pointer"}
        alt="logo"
        w={6}
        src={colorMode === "dark" ? "/light-logo.svg" : "/dark-logo.svg"} // Sử dụng giá trị colorMode để chọn đúng logo sáng/tối
        onClick={toggleColorMode} // Gọi hàm toggleColorMode khi click vào logo
      />
      {user && (
        <Flex alignItems={"center"} gap={4}>
          <Link as={RouterLink} to={`/${user.username}`}>
            <RxAvatar size={24} />
          </Link>
          <Link as={RouterLink} to={"/chat"}>
            <BsChatQuote size={24} />
          </Link>
          <Link as={RouterLink} to={"/settings"}>
            <MdOutlineSettings size={24} />
          </Link>
          <Button
            size={"xl"}
            bg={useColorModeValue("gray.300", "gray.dark")}
            onClick={handleLogOut}
          >
            <LuLogOut size={20} />
          </Button>
        </Flex>
      )}
      {!user && (
        <Link
          as={RouterLink}
          to={"/auth"}
          onClick={() => setAuthScreen("sigup")}
        >
          SigUp
        </Link>
      )}
    </Flex>
  );
};

export default Header;
