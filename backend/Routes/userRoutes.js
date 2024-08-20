import express from "express";
import {
  followUnFollowUser,
  freezeAccount,
  getProfile,
  getSuggestUsers,
  loginUser,
  logoutUser,
  signupUser,
  updateUser,
} from "../controller/userController.js";
import protectRoute from "../middlewares/protectRoute.js";

const router = express.Router();

router.get("/profile/:query", getProfile);
router.get("/suggestUsers", protectRoute, getSuggestUsers);

router.post("/signup", signupUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
// sẽ chạy protectRoute trước, nếu thỏa sẽ chạy followUnFollowUser
router.post("/follow/:id", protectRoute, followUnFollowUser);
router.put("/update/:id", protectRoute, updateUser);
router.put("/freeze", protectRoute, freezeAccount);

export default router;
