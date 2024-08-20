import {
  Avatar,
  Divider,
  Flex,
  Image,
  Skeleton,
  SkeletonCircle,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import React, { useEffect, useRef, useState } from "react";
import Message from "./Message";
import MessageInput from "./MessageInput";
import axios from "axios";
import { selectedConversationAtom } from "../atoms/messageAtom";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { toast } from "react-toastify";
import userAtom from "../atoms/userAtom";
import { useSocket } from "../context/SocketContext";
import { coversationAtom } from "../atoms/messageAtom";
import messageSound from "../assets/sounds/tin-nhan-iphone-pink.mp3";

const MessageContainer = () => {
  const selectedConversation = useRecoilValue(selectedConversationAtom);
  const [loadingMessage, setLoadingMessage] = useState(true);
  const [messages, setMessages] = useState([]);
  const currentUser = useRecoilValue(userAtom);
  const { socket } = useSocket();
  const setConversations = useSetRecoilState(coversationAtom);
  const messageEndRef = useRef(null);

  useEffect(() => {
    socket?.on("newMessage", (message) => {
      if (selectedConversation._id === message.conversationId) {
        setMessages((prev) => [...prev, message]);
      }
      if (!document.hasFocus()) {
        const sound = new Audio(messageSound);
        sound.play();
      }

      setMessages((prevMessage) => [...prevMessage, message]);
      setConversations((prev) => {
        const updateConversations = prev.map((conversation) => {
          if (conversation._id == selectedConversation._id) {
            return {
              ...conversation,
              lastMessage: {
                text: message.text,
                sender: message.sender,
              },
            };
          }
          return conversation;
        });
        return updateConversations;
      });
    });

    return () => socket.off("newMessage");
  }, [socket, selectedConversation, setConversations]);

  useEffect(() => {
    const lastMessageIsFromOtherUser =
      messages.length &&
      messages[messages.length - 1].sender !== currentUser.id;
    if (lastMessageIsFromOtherUser) {
      socket.emit("markMessageAsSeen", {
        conversationId: selectedConversation._id,
        userId: selectedConversation.userId,
      });
    }
    socket.on("messageSeen", ({ conversationId }) => {
      if (selectedConversation._id === conversationId) {
        setMessages((prev) => {
          const updateMessage = prev.map((message) => {
            if (!message.seen) {
              return {
                ...message,
                seen: true,
              };
            }
            return message;
          });
          return updateMessage;
        });
      }
    });
  }, [socket, currentUser.id, messages, selectedConversation]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    setLoadingMessage(true);
    setMessages([]);
    const getMessage = async () => {
      try {
        if (selectedConversation.mock) return;
        const res = await axios.get(
          `/api/messages/${selectedConversation.userId}`
        );
        if (res.data.error) {
          toast.error(res.data.error);
        } else {
          setMessages(res.data);
        }
      } catch (error) {
        toast.success(`Not mesage: ${selectedConversation.username}`);
      } finally {
        setLoadingMessage(false);
      }
    };
    getMessage();
  }, [selectedConversation.userId, selectedConversation.mock]);

  return (
    <Flex
      flex={"70"}
      bg={useColorModeValue("gray.200", "gray.dark")}
      borderRadius={"md"}
      flexDirection={"column"}
      p={2}
    >
      {selectedConversation && (
        <Flex w={"full"} h={12} alignItems={"center"} gap={2}>
          <Avatar src={selectedConversation.userProfilePic} size={"sm"} />
          <Text display={"flex"} alignItems={"center"}>
            {selectedConversation.username}
            <Image src="/verified.png" w={4} h={4} ml={1} />
          </Text>
        </Flex>
      )}

      <Divider />

      <Flex
        flexDir={"column"}
        gap={4}
        my={2}
        px={2}
        height={"400px"}
        overflowY={"auto"}
      >
        {loadingMessage &&
          [...Array(5)].map((_, i) => (
            <Flex
              key={i}
              gap={2}
              alignItems={"center"}
              p={1}
              borderRadius={"md"}
              alignSelf={i % 2 === 0 ? "flex-start" : "flex-end"}
            >
              {i % 2 === 0 && <SkeletonCircle size={7} />}
              <Flex flexDir={"column"} gap={2}>
                <Skeleton height={"8px"} w={"250px"} />
                <Skeleton height={"8px"} w={"250px"} />
              </Flex>
            </Flex>
          ))}

        {!loadingMessage && messages.length === 0 && (
          <Text alignSelf="center">Hãy nhắn tin cho nhau👋! </Text>
        )}

        {!loadingMessage &&
          messages.map((message, index) => (
            <Flex
              key={message._id}
              direction={"column"}
              ref={index === messages.length - 1 ? messageEndRef : null}
            >
              <Message
                message={message}
                ownMessage={currentUser.id === message.sender}
              />
            </Flex>
          ))}
      </Flex>
      <MessageInput setMessages={setMessages} />
    </Flex>
  );
};

export default MessageContainer;
