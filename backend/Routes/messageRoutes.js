import express from "express";
import protectRoute from "../middlewares/protectRoute.js";
import {
  getConversation,
  getMessages,
  sendMessage,
} from "../controller/messageController.js";

const router = express.Router();

router.post("/", protectRoute, sendMessage);
router.get("/:otherUserId", protectRoute, getMessages);
router.get("/", protectRoute, getConversation);

export default router;
