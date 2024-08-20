import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const useGetUserProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { username } = useParams(); // Đảm bảo lấy `username` đúng cách

  useEffect(() => {
    const getUser = async () => {
      try {
        const res = await axios.get(`/api/users/profile/${username}`); // Đảm bảo đường dẫn API đúng
        if (res.data.error) {
          toast("Error getting user");
          return;
        }
        if (res.data.isFrozen) {
          setUser(null);
          return;
        }
        setUser(res.data);
      } catch (error) {
        toast("Error getting user", error);
      } finally {
        setLoading(false);
      }
    };
    if (username) {
      getUser();
    }
  }, [username]);

  return { user, loading };
};

export default useGetUserProfile;
