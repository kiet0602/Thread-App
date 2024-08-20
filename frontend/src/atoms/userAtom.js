import { atom } from "recoil";

const userAtom = atom({
  key: "userAtom",
  default: JSON.parse(localStorage.getItem("user-threads")), //Giá trị mặc định của atom
});

export default userAtom;
