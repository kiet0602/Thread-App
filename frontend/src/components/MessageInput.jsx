import {
  Flex,
  Input,
  InputGroup,
  InputRightElement,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Image,
  useDisclosure,
  Spinner,
} from "@chakra-ui/react";
import axios from "axios";
import React, { useRef, useState } from "react";
import { IoSendSharp } from "react-icons/io5";
import { toast } from "react-toastify";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  coversationAtom,
  selectedConversationAtom,
} from "../atoms/messageAtom";
import { BsFillImageFill } from "react-icons/bs";
import usePreviewImg from "../Hooks/usePreviewImg";

const MessageInput = ({ setMessages }) => {
  const [messageText, setMessageText] = useState("");
  const selectedConversation = useRecoilValue(selectedConversationAtom);
  const [conversations, setConversations] = useRecoilState(coversationAtom); // Lấy cả giá trị và hàm cập nhật
  const imageRef = useRef(null);
  const { onClose } = useDisclosure();
  const { handleImagechange, imgUrl, setImgUrl } = usePreviewImg();
  const [isSending, setIsSending] = useState(false);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText && !imgUrl) return;
    if (isSending) return;
    setIsSending(true);
    try {
      const res = await axios.post("/api/messages", {
        recipientId: selectedConversation.userId,
        message: messageText,
        img: imgUrl,
      });

      setMessages((messages) => [...messages, res.data]); // Thêm tin nhắn mới vào danh sách tin nhắn hiện tại

      // Cập nhật lại conversation
      setConversations((prevConvs) => {
        const updatedConversations = prevConvs.map((conversation) => {
          if (conversation._id === selectedConversation._id) {
            return {
              ...conversation, // Sao chép tất cả các thuộc tính của conversation vào đối tượng mới
              lastMessage: {
                text: messageText,
                sender: res.data.sender, // Sử dụng dữ liệu từ phản hồi của API
              },
            };
          }
          return conversation;
        });
        return updatedConversations;
      });

      setMessageText("");
      setImgUrl("");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Flex gap={2} alignItems={"center"}>
      <form onSubmit={handleSendMessage} style={{ flex: 95 }}>
        <InputGroup>
          <Input
            w={"full"}
            placeholder="Type a message..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
          />
          <InputRightElement cursor={"pointer"}>
            <IoSendSharp color={"green.500"} />
          </InputRightElement>
        </InputGroup>
      </form>

      <Flex flex={5} cursor={"pointer"}>
        <BsFillImageFill size={20} onClick={() => imageRef.current.click()} />
        <Input
          type={"file"}
          hidden
          ref={imageRef}
          onChange={handleImagechange}
        />
      </Flex>
      <Modal
        isOpen={imgUrl}
        onClose={() => {
          onClose();
          setImgUrl("");
        }}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {" "}
            <span>Ảnh</span>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex
              mt={5}
              w={"full"}
              justifyContent={"center"}
              alignItems={"center"}
            >
              <Image
                src={imgUrl}
                boxSize="100%"
                maxW="300px"
                maxH="300px"
                objectFit="contain"
                borderRadius={10}
              />
            </Flex>
            <Flex justifyContent={"flex-end"} my={2}>
              {!isSending ? (
                <IoSendSharp
                  color={"green.500"}
                  size={24}
                  cursor={"pointer"}
                  onClick={handleSendMessage}
                />
              ) : (
                <Spinner size={"md"} />
              )}
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Flex>
  );
};

export default MessageInput;
