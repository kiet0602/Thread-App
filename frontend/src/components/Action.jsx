import React, { useState } from "react";
import {
  Box,
  Button,
  Flex,
  FormControl,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useDisclosure,
} from "@chakra-ui/react";

import { useRecoilState, useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import { toast } from "react-toastify";
import axios from "axios";
import postAtom from "../atoms/postAtom";

const Action = ({ post }) => {
  // Lấy thông tin người dùng hiện tại từ Recoil
  const user = useRecoilValue(userAtom);
  // Khởi tạo trạng thái `liked` để kiểm tra xem người dùng đã thích bài viết hay chưa
  const [liked, setLiked] = useState(post.likes.includes(user?.id));
  const [isLiking, setIsLiking] = useState(false);

  const [posts, setPosts] = useRecoilState(postAtom);

  const [reply, setReply] = useState("");
  const [isRepling, setIsRepling] = useState(false);

  const { isOpen, onOpen, onClose } = useDisclosure();

  // Hàm xử lý việc thích và bỏ thích bài viết
  const handleLikedAndUnliked = async () => {
    // Kiểm tra xem người dùng đã đăng nhập hay chưa
    if (!user) return toast("Logged in liked");
    if (isLiking) return;
    setIsLiking(true);
    try {
      // Gửi yêu cầu lên server để cập nhật trạng thái thích
      const response = await axios.put("/api/posts/like/" + post._id);
      // Kiểm tra xem có lỗi từ server không
      if (response.data.error) {
        return toast(response.data.error);
      }
      // Cập nhật trạng thái thích và danh sách người dùng đã thích bài viết
      if (!liked) {
        // Nếu người dùng chưa thích bài viết
        const updatePost = posts.map((p) => {
          // Kiểm tra xem bài viết có ID trùng với bài viết hiện tại không
          if (p._id === post._id) {
            // Nếu trùng, tạo một bản sao mới của bài viết với ID người dùng thêm vào danh sách likes
            return { ...p, likes: [...p.likes, user._id] };
          }
          // Nếu không trùng, trả về bài viết gốc
          return p;
        });
        // Cập nhật state posts với mảng mới
        setPosts(updatePost);
      } else {
        // Nếu đã thích, loại bỏ ID của người dùng khỏi danh sách likes
        const updatePost = posts.map((p) => {
          // Kiểm tra xem bài viết có ID trùng với bài viết hiện tại không
          if (p._id === post._id) {
            // Nếu trùng, tạo một bản sao mới của bài viết với ID người dùng bị loại bỏ khỏi danh sách likes
            return { ...p, likes: p.likes.filter((id) => id !== user._id) };
          }
          // Nếu không trùng, trả về bài viết gốc
          return p;
        });
        // Cập nhật state posts với mảng mới
        setPosts(updatePost);
      }

      // Đổi trạng thái liked
      setLiked(!liked);
    } catch (error) {
      // Hiển thị lỗi nếu có
      toast(error.message);
    } finally {
      setIsLiking(false);
    }
  };
  const handleReply = async () => {
    if (!user) return toast.error("You must be logged in to reply post");
    if (isRepling) return;
    setIsRepling(true);
    try {
      const response = await axios.put("/api/posts/reply/" + post._id, {
        text: reply,
      });
      if (response.data.error) return toast.error(response.data.error);
      const updatePost = posts.map((p) => {
        if (p._id === post._id) {
          return { ...p, replies: [...p.replies, response.data] };
        }
        return p;
      });
      setPosts(updatePost);
      toast.success("Send reply successfully");
      onClose();
      setReply("");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsRepling(false);
    }
  };

  return (
    <Flex flexDirection={"column"}>
      <Flex gap={3} my={2} onClick={(e) => e.preventDefault()}>
        <svg
          aria-label="Like"
          color={liked ? "rgb(237, 73, 86)" : ""}
          /* transparent là một giá trị CSS làm cho một phần tử trở nên trong suốt, không có màu. */
          fill={liked ? "rgb(237, 73, 86)" : "transparent"}
          cursor={"pointer"}
          height="19"
          role="img"
          viewBox="0 0 24 22"
          width="20"
          onClick={handleLikedAndUnliked}
        >
          <path
            d="M1 7.66c0 4.575 3.899 9.086 9.987 12.934.338.203.74.406 1.013.406.283 0 .686-.203 1.013-.406C19.1 16.746 23 12.234 23 7.66 23 3.736 20.245 1 16.672 1 14.603 1 12.98 1.94 12 3.352 11.042 1.952 9.408 1 7.328 1 3.766 1 1 3.736 1 7.66Z"
            stroke="currentColor"
            strokeWidth="2"
          ></path>
        </svg>

        <svg
          aria-label="Comment"
          color=""
          fill=""
          height="20"
          role="img"
          viewBox="0 0 24 24"
          width="20"
          cursor={"pointer"}
          onClick={onOpen}
        >
          <title>Comment</title>
          <path
            d="M20.656 17.008a9.993 9.993 0 1 0-3.59 3.615L22 22Z"
            fill="none"
            stroke="currentColor"
            strokeLinejoin="round"
            strokeWidth="2"
          ></path>
        </svg>

        <RepostSVG />
        <ShareSVG />
      </Flex>
      <Flex gap={2} alignItems={"center"}>
        <Text color={"gray.light"} fontSize="sm">
          {post.replies.length} replies
        </Text>
        <Box w={0.5} h={0.5} borderRadius={"full"} bg={"gray.light"}></Box>
        <Text color={"gray.light"} fontSize="sm">
          {post.likes.length} likes
        </Text>
      </Flex>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />

        <ModalContent>
          <ModalHeader> </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl>
              <Input
                placeholder="Reply gose here.."
                value={reply}
                onChange={(e) => setReply(e.target.value)}
              />
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="blue"
              size={"sm"}
              mr={3}
              isLoading={isRepling}
              onClick={handleReply}
            >
              reply
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
};

export default Action;

const RepostSVG = () => {
  return (
    <svg
      aria-label="Repost"
      color="currentColor"
      fill="currentColor"
      height="20"
      role="img"
      cursor={"pointer"}
      viewBox="0 0 24 24"
      width="20"
    >
      <title>Repost</title>
      <path
        fill=""
        d="M19.998 9.497a1 1 0 0 0-1 1v4.228a3.274 3.274 0 0 1-3.27 3.27h-5.313l1.791-1.787a1 1 0 0 0-1.412-1.416L7.29 18.287a1.004 1.004 0 0 0-.294.707v.001c0 .023.012.042.013.065a.923.923 0 0 0 .281.643l3.502 3.504a1 1 0 0 0 1.414-1.414l-1.797-1.798h5.318a5.276 5.276 0 0 0 5.27-5.27v-4.228a1 1 0 0 0-1-1Zm-6.41-3.496-1.795 1.795a1 1 0 1 0 1.414 1.414l3.5-3.5a1.003 1.003 0 0 0 0-1.417l-3.5-3.5a1 1 0 0 0-1.414 1.414l1.794 1.794H8.27A5.277 5.277 0 0 0 3 9.271V13.5a1 1 0 0 0 2 0V9.271a3.275 3.275 0 0 1 3.271-3.27Z"
      ></path>
    </svg>
  );
};

const ShareSVG = () => {
  return (
    <svg
      aria-label="Share"
      color=""
      cursor={"pointer"}
      fill="rgb(243, 245, 247)"
      height="20"
      role="img"
      viewBox="0 0 24 24"
      width="20"
    >
      <title>Share</title>
      <line
        fill="none"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="2"
        x1="22"
        x2="9.218"
        y1="3"
        y2="10.083"
      ></line>
      <polygon
        fill="none"
        points="11.698 20.334 22 3.001 2 3.001 9.218 10.084 11.698 20.334"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="2"
      ></polygon>
    </svg>
  );
};
