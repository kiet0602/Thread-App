import { AddIcon } from "@chakra-ui/icons";
import {
  Button,
  Flex,
  FormControl,
  Image,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  Textarea,
  useColorModeValue,
  useDisclosure,
  CloseButton,
} from "@chakra-ui/react";
import { BsFillImageFill } from "react-icons/bs";
import { useRef, useState } from "react";
import usePreviewImg from "../Hooks/usePreviewImg";
import { useRecoilState, useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import axios from "axios";
import { toast } from "react-toastify";
import postAtom from "../atoms/postAtom";
import { useParams } from "react-router-dom";

const MAX_CHARS = 500;
const CreatePost = () => {
  const { isOpen, onOpen, onClose } = useDisclosure(); // thư viện model
  const [postText, setPostText] = useState("");
  const imageRef = useRef(null); // chuyển đến input bị ẩn
  const [remainingChar, setRemainingChar] = useState(MAX_CHARS); // giới hạn textPost
  const { handleImagechange, imgUrl, setImgUrl } = usePreviewImg(); // tự tạo hook để sử dụng
  const user = useRecoilValue(userAtom); // lấy dữ liệu user có sẳn trong hệ thống từ userAtom
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useRecoilState(postAtom);
  const { username } = useParams();

  const handleTextChange = (e) => {
    const inputText = e.target.value;
    if (inputText.length > MAX_CHARS) {
      const truncatedText = inputText.slice(0, MAX_CHARS); // slice: lấy kí tự đầu tiên đến 500
      setPostText(truncatedText); // set 500 kí tự
      setRemainingChar(0);
    } else {
      setPostText(inputText);
      setRemainingChar(MAX_CHARS - inputText.length); // giảm dần 500
    }
  };
  const handleCreatePost = async () => {
    setLoading(true);
    try {
      const res = await axios.post("/api/posts/create", {
        postedBy: user.id,
        text: postText,
        img: imgUrl,
      });
      toast.success("Created Post successfully!");
      if (username === user.username) {
        setPosts([res.data, ...posts]);
      }

      onClose();
      setPostText("");
      setImgUrl("");
    } catch (error) {
      toast.error("Fails creating post");
    } finally {
      setLoading(false);
    }
  };

  console.log("recoil", posts);
  return (
    <>
      <Button
        position={"fixed"}
        bottom={10}
        right={10}
        bg={useColorModeValue("gray.300", "gray.dark")}
        onClick={onOpen}
        size={{ base: "sm", sm: "md" }}
      >
        <AddIcon />
      </Button>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />

        <ModalContent>
          <ModalHeader>Create Post</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl>
              <Textarea
                placeholder="Post content gose here.."
                onChange={handleTextChange}
                value={postText}
              />
              <Text
                fontSize="xs"
                fontWeight="bold"
                textAlign={"right"}
                m={"1"}
                color={"gray.800"}
              >
                {remainingChar}/{MAX_CHARS}
              </Text>
              <input
                type="file"
                hidden
                ref={imageRef}
                onChange={handleImagechange}
              />
              <BsFillImageFill
                style={{ marginLeft: "5px", cursor: "pointer" }}
                size={16}
                onClick={() => imageRef.current.click()}
              />
            </FormControl>
            {imgUrl && (
              <Flex mt={5} w={"full"} position={"relative"}>
                <Image src={imgUrl} alt="select img" />
                <CloseButton
                  onClick={() => {
                    setImgUrl("");
                  }}
                  bg={"gray.800"}
                  position={"absolute"}
                  top={2}
                  right={2}
                />
              </Flex>
            )}
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="blue"
              mr={3}
              onClick={handleCreatePost}
              isLoading={loading}
            >
              Post
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default CreatePost;
