import { useState } from "react";
import { useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import { toast } from "react-toastify";
import axios from "axios";

const useFollowUnfollowing = (user) => {
  const currentUser = useRecoilValue(userAtom);

  const [following, setFollowing] = useState(
    user.followers.includes(currentUser?.id)
  ); //.includes(currentUser.id) kiểm tra xem ID của người dùng hiện tại có tồn tại trong mảng user.followers hay không. (true or false)
  const [updating, setUpdating] = useState(false);

  const handleFollowUnFollow = async () => {
    if (!currentUser) {
      toast.error("Please login to follow");
    }
    if (updating) {
      return;
    }
    setUpdating(true);
    try {
      await axios.post(`/api/users/follow/${user._id}`);
      if (!following) {
        user.followers.pop(); //xóa ra khỏi mảng user.followers
        toast(`Followed ${user.name} `);
      } else {
        user.followers.push(currentUser?.id); //xóa ra khỏi mảng user.followers
        toast(`UnFollowed ${user.name} `);
      }
      setFollowing(!following);
    } catch (error) {
      console.log(error.message);
    } finally {
      setUpdating(false);
    }
  };
  return { handleFollowUnFollow, updating, following };
};

export default useFollowUnfollowing;
