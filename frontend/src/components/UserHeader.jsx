import { Box, Flex, Link, Text, VStack } from "@chakra-ui/layout";
import { Avatar } from "@chakra-ui/avatar";
import { BsInstagram } from "react-icons/bs";
import { CgMoreO } from "react-icons/cg";
import { Menu, MenuButton, MenuItem, MenuList } from "@chakra-ui/menu";
import { Portal } from "@chakra-ui/portal";
import { useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import { Button, useColorModeValue } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { toast } from "react-toastify";
import useFollowUnfollowing from "../Hooks/useFollowUnfollowing";

const UserHeader = ({ user }) => {
  // user : info của User trang mình đang đứng

  const currentUser = useRecoilValue(userAtom); // Kiểm tra xem User có đang ở (trang của mình) hay không!
  //currentUser: là info của tài khoảng đang đăng nhập!

  const { handleFollowUnFollow, following, updating } =
    useFollowUnfollowing(user);

  // Định nghĩa hàm sao chép URL hiện tại vào clipboard
  const copyURL = () => {
    // Lấy URL hiện tại của trang web
    const currentURL = window.location.href;
    // Sử dụng API Clipboard của trình duyệt để sao chép URL vào clipboard
    navigator.clipboard.writeText(currentURL).then(() => {
      // Hiển thị thông báo "Copy" khi sao chép thành công
      toast("Copyed");
    });
  };

  return (
    <VStack gap={4} alignItems={"start"}>
      <Flex justifyContent={"space-between"} w={"full"}>
        <Box>
          <Text fontSize={"2xl"} fontWeight={"bold"}>
            {user.name}
          </Text>
          <Flex gap={2} alignItems={"center"}>
            <Text fontSize={"sm"}>{user.username}</Text>

            <Text
              fontSize={"xs"}
              // gray.dark va gray.light đã có tạo trước đó bên components cha là main.jsx
              bg={"gray.dark"}
              color={"gray.light"}
              p={1}
              borderRadius={"full"}
            >
              theards.next
            </Text>
          </Flex>
        </Box>
        <Box>
          {user.profilePic && (
            <Avatar
              name={user.name}
              src={user.profilePic}
              size={{
                base: "md",
                md: "xl",
              }}
            />
          )}
          {!user.profilePic && (
            <Avatar
              name={user.name}
              src="https://bit.ly/broken-link"
              size={{
                base: "md",
                md: "xl",
              }}
            />
          )}
        </Box>
      </Flex>

      <Text>{user.bio} </Text>
      {currentUser?.id === user._id && (
        <Link as={RouterLink} to="/update">
          <Button size={"sm"} bg={useColorModeValue("gray.300", "gray.dark")}>
            Update Profile
          </Button>
        </Link>
      )}
      {currentUser?.id !== user._id && (
        <Button
          size={"sm"}
          onClick={handleFollowUnFollow}
          isLoading={updating}
          bg={useColorModeValue("gray.300", "gray.dark")}
        >
          {following ? "UnFollow" : "Follow"}
        </Button>
      )}
      <Flex w={"full"} justifyContent={"space-between"}>
        <Flex gap={2} alignItems={"center"}>
          <Text color={"gray.light"}>{user.followers.length} follower</Text>
          <Box w={1} h={1} bg={"gray.light"} borderRadius={"full"}></Box>
          <Link color={"gray.light"}>instagram</Link>
        </Flex>
        <Flex>
          <Box className="icon-container">
            <BsInstagram size={24} cursor={"pointer"} />
          </Box>
          <Box className="icon-container">
            <Menu>
              <MenuButton>
                <CgMoreO size={24} cursor={"pointer"} />
              </MenuButton>
              <Portal>
                <MenuList bg={"gray.dark"}>
                  <MenuItem bg={"gray.dark"} onClick={copyURL}>
                    Copy link
                  </MenuItem>
                </MenuList>
              </Portal>
            </Menu>
          </Box>
        </Flex>
      </Flex>

      <Flex w={"full"}>
        <Flex
          flex={1}
          borderBottom={"1.5px solid white"}
          justifyContent={"center"}
          pb={3}
          cursor={"pointer"}
        >
          <Text fontWeight={"bold"}>Threads</Text>
        </Flex>
        <Flex
          flex={1}
          borderBottom={"1px solid gray"}
          justifyContent={"center"}
          color={"gray.light"}
          pb={3}
          cursor={"pointer"}
        >
          <Text fontWeight={"bold"}>Replies</Text>
        </Flex>
      </Flex>
    </VStack>
  );
};

export default UserHeader;
