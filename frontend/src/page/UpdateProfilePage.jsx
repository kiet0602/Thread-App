import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  useColorModeValue,
  Avatar,
  Center,
} from "@chakra-ui/react";
import { useRef, useState } from "react";
import userAtom from "../atoms/userAtom";
import { useRecoilState } from "recoil";
import usePreviewImg from "../Hooks/usePreviewImg";
import { toast } from "react-toastify";
import axios from "axios";

export default function UpdateProfilePage() {
  const [user, setUser] = useRecoilState(userAtom); // Đọc và ghi giá trị của atom. Trả về một mảng gồm giá trị hiện tại (user) và hàm cập nhật.

  const [updating, setUpdating] = useState(false);

  //const [password, setPassword] = useState(""); // State cho password không nằm trong userAtom.

  const fileRef = useRef(null); // Tạo một tham chiếu để truy cập vào input file.

  const { handleImagechange, imgUrl } = usePreviewImg();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (updating) {
      return;
    }
    setUpdating(true);
    try {
      const response = await axios.put(
        `/api/users/update/${user.id}`,
        {
          name: user.name,
          username: user.username,
          email: user.email,
          bio: user.bio,
          password: "",
          profilePic: imgUrl || user.profilePic, // Cập nhật ảnh đại diện nếu có
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        toast("Profile updated successfully");
        localStorage.setItem("user-threads", JSON.stringify(response.data));
      } else {
        toast.error("Failed to update profile");
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setUpdating(false);
    }
  };

  // Hàm xử lý khi có sự thay đổi trong các input
  const handleInputChange = (e) => {
    const { name, value } = e.target; // Lấy tên và giá trị của input từ sự kiện
    setUser((prevUser) => ({ ...prevUser, [name]: value })); // Cập nhật state user với giá trị mới
  };

  return (
    <form onSubmit={handleSubmit}>
      <Flex align={"center"} justify={"center"} my={6}>
        <Stack
          spacing={4}
          w={"full"}
          maxW={"md"}
          bg={useColorModeValue("white", "gray.dark")}
          rounded={"xl"}
          boxShadow={"lg"}
          p={6}
        >
          <Heading lineHeight={1.1} fontSize={{ base: "2xl", sm: "3xl" }}>
            User Profile Edit
          </Heading>
          <FormControl id="userName">
            <Stack direction={["column", "row"]} spacing={6}>
              <Center>
                <Avatar
                  size="xl"
                  boxShadow={"md"}
                  src={imgUrl || user.profilePic} // Hiển thị hình ảnh từ state hoặc hình ảnh mặc định của user
                />
              </Center>
              <Center w="full">
                <Button w="full" onClick={() => fileRef.current.click()}>
                  {/* Dựa vào fileRef mà nút này khi nhấn sẽ kích hoạt input có: ref={fileRef} */}
                  Change Avatar
                </Button>
                <Input
                  type="file"
                  hidden
                  ref={fileRef}
                  onChange={handleImagechange} // Hàm xử lý thay đổi hình ảnh
                />
              </Center>
            </Stack>
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Full name</FormLabel>
            <Input
              name="name" // Đặt tên cho input để xác định trường dữ liệu
              placeholder="NguyenKiet"
              _placeholder={{ color: "gray.500" }}
              type="text"
              value={user.name} // Giá trị của input lấy từ state user
              onChange={handleInputChange} // Hàm xử lý thay đổi giá trị
            />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>User name</FormLabel>
            <Input
              name="username"
              placeholder="Kiet"
              _placeholder={{ color: "gray.500" }}
              type="text"
              value={user.username}
              onChange={handleInputChange}
            />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Email address</FormLabel>
            <Input
              name="email"
              placeholder="your-email@example.com"
              _placeholder={{ color: "gray.500" }}
              type="email"
              value={user.email}
              onChange={handleInputChange}
            />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Bio</FormLabel>
            <Input
              name="bio"
              placeholder="Your Bio..."
              _placeholder={{ color: "gray.500" }}
              type="text"
              value={user.bio}
              onChange={handleInputChange}
            />
          </FormControl>
          {/*  <FormControl>
            <FormLabel>Password</FormLabel>
            <Input
              name="password"
              placeholder="password"
              _placeholder={{ color: "gray.500" }}
              type="password"
              value={password} // Sử dụng state riêng cho password
              onChange={(e) => {
                setPassword(e.target.value); // Cập nhật state password khi thay đổi giá trị
              }}
            />
          </FormControl> */}
          <Stack spacing={6} direction={["column", "row"]}>
            <Button
              bg={"red.400"}
              color={"white"}
              w="full"
              _hover={{
                bg: "red.500",
              }}
            >
              Cancel
            </Button>
            <Button
              bg={"green.400"}
              color={"white"}
              w="full"
              _hover={{
                bg: "green.500",
              }}
              type="submit"
              isLoading={updating}
            >
              Submit
            </Button>
          </Stack>
        </Stack>
      </Flex>
    </form>
  );
}
