import { Avatar } from "@chakra-ui/avatar";
import { Image } from "@chakra-ui/image";
import { Box, Flex, Text } from "@chakra-ui/layout";
import { BsThreeDots } from "react-icons/bs";
import { Link, useNavigate } from "react-router-dom";
import Action from "../components/Action";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { formatDistanceToNow } from "date-fns";
import { DeleteIcon } from "@chakra-ui/icons";
import { useRecoilState, useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import postAtom from "../atoms/postAtom";

const Post = ({ post, postedBy }) => {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useRecoilState(postAtom); // sử dụng Atom
  const currentUser = useRecoilValue(userAtom);
  const navigate = useNavigate();

  const formatTimeWithoutAbout = (date) => {
    let result = formatDistanceToNow(date);
    return result.replace(/^about\s+/, ""); // Loại bỏ "about " ở đầu chuỗi
  };

  useEffect(() => {
    const getUser = async () => {
      try {
        const response = await axios.get("/api/users/profile/" + postedBy);
        setUser(response.data);
      } catch (error) {
        toast.error(error.message);
        setUser(null);
      }
    };
    getUser();
  }, [postedBy]);

  const handleDetetePost = async (e) => {
    try {
      e.preventDefault();
      if (!window.confirm("Are you sure you want to delete this post?")) return;
      const response = await axios.delete(`/api/posts/${post._id}`);
      if (response.data.error) {
        toast(response.data.error);
        return;
      }
      toast.success("Delete post successfully");
      setPosts((prev) => prev.filter((p) => p._id !== post._id));
      //prev: mảng đag có
      //prev.filter :tìm và xóa p._id !== post._id nếu trùng nhau
      //mảng p là mảng mới được cập nhật cho setPosts
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (!user) return null;

  return (
    <Link to={`/${user.username}/post/${post._id}`}>
      <Flex gap={3} mb={4} py={5}>
        <Flex flexDirection={"column"} alignItems={"center"}>
          <Avatar
            size="md"
            name={user.name}
            src={user?.profilePic}
            onClick={(e) => {
              e.preventDefault();
              navigate(`/${user.username}`);
            }}
          />

          <Box w="1px" h={"full"} bg="gray.light" my={2}></Box>
          <Box position={"relative"} w={"full"}>
            {post.replies.length === 0 && <Text textAlign={"center"}>😔</Text>}

            {post.replies[0] && (
              <Avatar
                size="xs"
                name="John doe"
                src={post.replies[0].profilePic}
                position={"absolute"}
                top={"0px"}
                left="15px"
                padding={"2px"}
              />
            )}

            {post.replies[1] && (
              <Avatar
                size="xs"
                name="John doe"
                src={post.replies[1].profilePic}
                position={"absolute"}
                top={"0px"}
                left="15px"
                padding={"2px"}
              />
            )}
            {post.replies[2] && (
              <Avatar
                size="xs"
                name="John doe"
                src={post.replies[2].profilePic}
                position={"absolute"}
                top={"0px"}
                left="15px"
                padding={"2px"}
              />
            )}
          </Box>
        </Flex>
        <Flex flex={1} flexDirection={"column"} gap={2}>
          <Flex justifyContent={"space-between"} w={"full"}>
            <Flex w={"full"} alignItems={"center"}>
              <Text
                fontSize={"sm"}
                fontWeight={"bold"}
                onClick={(e) => {
                  e.preventDefault();
                  navigate(`/${user.username}`);
                }}
              >
                {user?.username}
              </Text>
              <Image src="/verified.png" w={4} h={4} ml={1} />
            </Flex>
            <Flex gap={4} alignItems={"center"}>
              <Text
                fontSize={"xs"}
                width={36}
                textAlign={"right"}
                color={"gray.light"}
              >
                {formatTimeWithoutAbout(new Date(post.createdAt))} ago
              </Text>
              <BsThreeDots />
              {currentUser?.id === user._id && (
                <DeleteIcon
                  size={20}
                  cursor={"pointer"}
                  onClick={handleDetetePost}
                />
              )}
            </Flex>
          </Flex>

          <Text fontSize={"sm"}>{post.text}</Text>
          {post.img && (
            <Box
              borderRadius={6}
              overflow={"hidden"}
              border={"1px solid"}
              borderColor={"gray.light"}
            >
              <Image src={post.img} w={"full"} />
            </Box>
          )}

          <Flex gap={3} my={1}>
            <Action post={post} />
          </Flex>
        </Flex>
      </Flex>
    </Link>
  );
};

export default Post;
