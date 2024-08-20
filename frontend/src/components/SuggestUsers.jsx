import { Box, Flex, Skeleton, SkeletonCircle, Text } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import SuggestUser from "./SuggestUser";
import { toast } from "react-toastify";
import axios from "axios";

const SuggestUsers = () => {
  const [loading, setLoading] = useState(false);
  const [suggestUsers, setSuggestUsers] = useState([]);

  useEffect(() => {
    const getSuggestUsers = async () => {
      setLoading(true);
      try {
        const res = await axios.get("/api/users/suggestUsers");
        setSuggestUsers(res.data);
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };
    getSuggestUsers();
  }, []);
  return (
    <>
      <Text mb={7} fontWeight={"bold"}>
        Suggested User
      </Text>
      <Flex direction={"column"} gap={4}>
        {!loading &&
          suggestUsers.map((user) => (
            <SuggestUser key={user._id} user={user} />
          ))}
        {loading &&
          [0, 1, 2, 3, 4].map((_, index) => (
            <Flex
              key={index}
              gap={2}
              alignItems={"center"}
              p={"1"}
              borderRadius={"md"}
            >
              <Box>
                <SkeletonCircle size={"10"} />
              </Box>
              <Flex w={"full"} flexDirection={"column"} gap={2}>
                <Skeleton h={"8px"} w={"80px"} />
                <Skeleton h={"8px"} w={"80px"} />
              </Flex>
              <Flex>
                <Skeleton h={"20px"} w={"60px"} />
              </Flex>
            </Flex>
          ))}
      </Flex>
    </>
  );
};

export default SuggestUsers;
