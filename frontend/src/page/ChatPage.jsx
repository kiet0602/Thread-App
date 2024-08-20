import { SearchIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Flex,
  Input,
  Skeleton,
  SkeletonCircle,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import Conversation from "../components/Conversation";
import { GiConversation } from "react-icons/gi";
import MesssgeContainer from "../components/MesssgeContainer";
import { toast } from "react-toastify";
import axios from "axios";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  coversationAtom,
  selectedConversationAtom,
} from "../atoms/messageAtom";
import userAtom from "../atoms/userAtom";
import { useSocket } from "../context/SocketContext";

const ChatPage = () => {
  const [loadingConversation, setLoadingConversation] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [searchingUser, setSearchingUser] = useState(false);
  const [conversations, setConversations] = useRecoilState(coversationAtom); // sử dụng atom lưu dữ liệu getConversations
  const currentUser = useRecoilValue(userAtom);
  const [selectedConversation, setSeletedConversation] = useRecoilState(
    selectedConversationAtom
  );
  const { socket, onlineUsers } = useSocket();

  useEffect(() => {
    socket?.on("messageSeen", ({ conversationId }) => {
      setConversations((prev) => {
        const updatedConversations = prev.map((conversation) => {
          if (conversation._id === conversationId) {
            return {
              ...conversation,
              lastMessage: {
                ...conversation.lastMessage,
                seen: true,
              },
            };
          }
          return conversation;
        });
        return updatedConversations;
      });
    });
  }, [socket, setConversations]);

  useEffect(() => {
    setSeletedConversation({});
    const getConversations = async () => {
      try {
        const res = await axios.get("/api/messages");
        if (res.data.error) {
          toast.error(res.data.error);
        }
        setConversations(res.data);
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoadingConversation(false);
      }
    };
    getConversations();
  }, []);

  const handleConversationSearch = async (e) => {
    e.preventDefault();
    setSearchingUser(true);
    try {
      const res = await axios(`/api/users/profile/${searchText}`);
      const searchUser = res.data;

      if (searchUser.error) {
        toast.error(searchUser.error);
        setSearchingUser(false);
        return;
      }

      // Không thể tìm nhắn tin cho bản thân
      if (searchUser._id === currentUser.id) {
        toast.error("Not send message youself!");
        setSearchingUser(false);
        return;
      }

      // Tìm những đoạn hội thoại đã được nhắn rồi
      const existingConversation = conversations.find((conversation) =>
        conversation.participants.some(
          (participant) => participant._id === searchUser._id
        )
      );

      if (existingConversation) {
        setSeletedConversation({
          _id: existingConversation._id,
          userId: searchUser._id,
          username: searchUser.username,
          userProfilePic: searchUser.profilePic,
        });
      } else {
        // Tạo cuộc hội thoại mới với người chưa nhắn tin (chưa có đoạn hội thoại)
        const mockConversation = {
          mock: true,
          lastMessage: {
            text: "",
            sender: "",
          },
          _id: Date.now().toString(),
          participants: [
            {
              _id: searchUser._id,
              username: searchUser.username,
              profilePic: searchUser.profilePic,
            },
          ],
        };

        setConversations((prevConvs) => [...prevConvs, mockConversation]);
        setSeletedConversation({
          _id: mockConversation._id,
          userId: searchUser._id,
          username: searchUser.username,
          userProfilePic: searchUser.profilePic,
        });
      }
    } catch (error) {
      toast.error(`Not Found: ${searchText}`);
    } finally {
      setSearchingUser(false);
    }
  };

  return (
    <Box
      position={"absolute"}
      left={"50%"}
      w={{
        base: "100%",
        md: "80%",
        lg: "750px",
      }}
      p={4}
      transform={"translateX(-50%)"}
    >
      <Flex
        gap={4}
        flexDirection={{
          base: "column",
          md: "row",
        }}
        maxWidth={{
          sm: "400px",
          md: "full",
        }}
        mx={"auto"}
      >
        <Flex
          flex={30}
          gap={2}
          flexDirection={"column"}
          maxW={{
            sm: "250px",
            md: "full",
          }}
          mx={"auto"}
        >
          <Text
            fontWeight={700}
            color={useColorModeValue("gray.600", "gray.400")}
          >
            Your Conversation{" "}
          </Text>
          <form onSubmit={handleConversationSearch}>
            <Flex alignItems={"center"} gap={2}>
              <Input
                placeholder="Search"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
              <Button size={"sm"} type="submit" isLoading={searchingUser}>
                <SearchIcon />
              </Button>
            </Flex>
          </form>
          {loadingConversation &&
            [0, 1, 2, 3, 4, 5].map((_, i) => (
              <Flex
                key={i}
                gap={4}
                alignItems={"center"}
                p={"1"}
                borderRadius={"md"}
              >
                <Box>
                  <SkeletonCircle size={"10"} />
                </Box>

                <Flex w={"full"} flexDirection={"column"} gap={3}>
                  <Skeleton h={"10px"} w={"80px"}></Skeleton>
                  <Skeleton h={"8px"} w={"90%"}></Skeleton>
                </Flex>
              </Flex>
            ))}
          {!loadingConversation &&
            conversations.map((conversation) => (
              <Conversation
                key={conversation._id}
                isOnline={onlineUsers.includes(
                  conversation.participants[0]._id
                )}
                conversation={conversation}
              />
            ))}
        </Flex>

        {!selectedConversation._id && (
          <Flex
            flex={70}
            borderRadius={"md"}
            p={2}
            flexDir={"column"}
            alignItems={"center"}
            justifyContent={"center"}
            height={"400px"}
          >
            <GiConversation size={100} />
            <Text>Select a conversation to start message</Text>
          </Flex>
        )}
        {selectedConversation._id && <MesssgeContainer />}
      </Flex>
    </Box>
  );
};

export default ChatPage;
