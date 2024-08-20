import { Button, Text } from "@chakra-ui/react";
import axios from "axios";
import React from "react";
import { toast } from "react-toastify";
import useLogOut from "../Hooks/useLogOut";

const SettingsPage = () => {
  const logout = useLogOut();
  const freezeAccount = async () => {
    if (!window.confirm("Are you sure you want to freeze")) return;
    try {
      const res = await axios.put("/api/users/freeze");
      const data = res.data;
      if (data.error) {
        toast.error(data.error);
      }
      if (data.success) {
        await logout();
        toast.success("Account Freezen successfully");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };
  return (
    <>
      <Text my={1} fontWeight={"bold"}>
        Freeze Your Account
      </Text>
      <Text my={1}>You can unfreeze your account anytime by logging in.</Text>
      <Button size={"sm"} colorScheme="red" onClick={freezeAccount}>
        Freeze
      </Button>
    </>
  );
};

export default SettingsPage;
