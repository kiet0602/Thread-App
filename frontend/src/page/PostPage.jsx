import {
  Avatar,
  Box,
  Button,
  Divider,
  Flex,
  Image,
  Spinner,
  Text,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { BsThreeDots } from "react-icons/bs";
import Action from "../components/Action";
import Comment from "../components/Comment";
import { toast } from "react-toastify";
import useGetUserProfile from "../Hooks/useGetUserProfile";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { formatDistanceToNow } from "date-fns";
import userAtom from "../atoms/userAtom";
import { useRecoilState, useRecoilValue } from "recoil";
import { DeleteIcon } from "@chakra-ui/icons";
import postAtom from "../atoms/postAtom";

const PostPage = () => {
  const { user, loading } = useGetUserProfile();
  const { pid } = useParams();
  const navigate = useNavigate();
  const [posts, setPosts] = useRecoilState(postAtom);
  const currentUser = useRecoilValue(userAtom);

  const formatTimeWithoutAbout = (date) => {
    let result = formatDistanceToNow(date);
    return result.replace(/^about\s+/, ""); // Loại bỏ "about " ở đầu chuỗi
  };

  // vì trang lấy có 1 post nên phải khai báo này(để lấy element 0 trong mảng postAtom)
  // vì postAtom là mảng
  const currentPost = posts[0];
  //quên thì in ra: console.log(posts)

  const handleDetetePost = async (e) => {
    try {
      e.preventDefault();
      if (!window.confirm("Are you sure you want to delete this post?")) return;
      const response = await axios.delete(`/api/posts/${currentPost._id}`);
      if (response.data.error) {
        toast(response.data.error);
        return;
      }
      toast.success("Delete post successfully");
      navigate(`${user.username}`);
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    const getPost = async () => {
      setPosts([]);
      try {
        const response = await axios.get(`/api/posts/${pid}`);
        setPosts([response.data]);
      } catch (error) {
        toast.error(error.message);
      }
    };
    getPost();
  }, [pid, setPosts]);

  if (!user && loading) {
    return (
      <Flex justifyContent={"center"}>
        <Spinner size={"xl"} />;
      </Flex>
    );
  }

  if (!currentPost) {
    return null;
  }

  return (
    <>
      <Flex>
        <Flex w={"full"} alignItems={"center"} gap={3}>
          <Avatar src={user.profilePic} size={"md"} name={user.name} />
          <Flex>
            <Text fontSize={"sm"} fontWeight={"bold"}>
              {user.username}
            </Text>
            <Image src="/verified.png" w="4" h={4} ml={4} />
          </Flex>
        </Flex>
        <Flex gap={4} alignItems={"center"}>
          <Text
            fontSize={"xs"}
            width={36}
            textAlign={"right"}
            color={"gray.light"}
          >
            {formatTimeWithoutAbout(new Date(currentPost.createdAt))} ago
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
      <Text my={3}>{currentPost.text}</Text>
      {currentPost.img && (
        <Box
          borderRadius={6}
          overflow={"hidden"}
          border={"1px solid"}
          borderColor={"gray.light"}
        >
          <Image src={currentPost.img} w={"full"} />
        </Box>
      )}
      <Flex gap={3} my={3}>
        <Action post={currentPost} />
      </Flex>

      <Divider my={4} />
      <Flex justifyContent={"space-between"}>
        <Flex gap={2} alignItems={"center"}>
          {/* ctrl + i => icon */}
          <Text fontSize={"2xl"}>👋</Text>
          <Text color={"gray.light"}>Get the app to like</Text>
        </Flex>
        <Button>Get</Button>
      </Flex>
      <Divider my={4} />
      {currentPost.replies.map((reply) => (
        <Comment
          key={reply.id}
          reply={reply}
          lastReply={
            reply._id ===
            currentPost.replies[currentPost.replies.length - 1]._id
          }
        />
      ))}
    </>
  );
};

export default PostPage;
