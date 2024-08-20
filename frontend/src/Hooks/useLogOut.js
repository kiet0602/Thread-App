import axios from "axios";
import { toast } from "react-toastify";
import { useSetRecoilState } from "recoil";
import userAtom from "../atoms/userAtom";
import { useNavigate } from "react-router-dom";

const useLogOut = () => {
  const navigate = useNavigate();
  const setUser = useSetRecoilState(userAtom);

  const handleLogout = async () => {
    try {
      const res = await axios.post(
        "/api/users/logout",
        {},
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = res.data;

      if (data.error) {
        toast.error(data.error);
        return;
      }
      setUser(null);
      localStorage.removeItem("user-threads");
      navigate("/auth");
      toast.success("User logged out");
    } catch (error) {
      // Sử dụng error.response.data nếu có, hoặc error.message nếu không có
      const errorMessage = error.response?.data?.error;
      toast.error(errorMessage);
    }
  };

  return handleLogout;
};

export default useLogOut;
