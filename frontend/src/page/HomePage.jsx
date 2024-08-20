import { Box, Flex, Spinner } from "@chakra-ui/react";
import axios from "axios";
import React, { useEffect, useState } from "react";

import { toast } from "react-toastify";
import Post from "../components/Post";
import { useRecoilState } from "recoil";
import postAtom from "../atoms/postAtom";
import SuggestUsers from "../components/SuggestUsers";

const HomePage = () => {
  const [posts, setPosts] = useRecoilState(postAtom);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setPosts([]);
    const getFeedPost = async () => {
      // lấy các bài viết của những người đag following
      try {
        const res = await axios.get("/api/posts/feed");
        setPosts(res.data);
      } catch (error) {
        toast.error("Error", error.message);
      } finally {
        setLoading(false);
      }
    };
    getFeedPost();
  }, [setPosts]);
  return (
    <Flex gap={"10"} alignItems={"flex-start"}>
      <Box flex={70}>
        {!loading && posts.length === 0 && (
          <h1>Follow some user to see the feed</h1>
        )}
        {loading && (
          <Flex justify={"center"}>
            <Spinner size={"xl"} />
          </Flex>
        )}
        {posts.map((post) => (
          <Post key={post._id} post={post} postedBy={post.postedBy} />
        ))}
      </Box>
      <Box flex={30} display={{ base: "none", md: "block" }}>
        <SuggestUsers />
      </Box>
    </Flex>
  );
};

export default HomePage;
