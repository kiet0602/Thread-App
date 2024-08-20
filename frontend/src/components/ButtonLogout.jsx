import { Button, useColorModeValue } from "@chakra-ui/react";
import React from "react";
import useLogOut from "../Hooks/useLogOut";

const ButtonLogout = () => {
  const handleLogout = useLogOut();

  return (
    <Button
      position={"fixed"}
      top={"30px"}
      right={"30px"}
      size={"sm"}
      onClick={handleLogout}
      bg={useColorModeValue("gray.300", "gray.dark")}
    >
      Logout
    </Button>
  );
};

export default ButtonLogout;
