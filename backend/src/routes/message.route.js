import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {
  getUsersForSidebar,
  getMessages,
  sendMessage,
  deleteMessage,
} from "../controllers/message.controller.js";

const router = express.Router();

router.get("/users", protectRoute, getUsersForSidebar);
router.get("/:id", protectRoute, getMessages);

router.post("/send/:id", protectRoute, sendMessage);

router.delete("/:messageId", protectRoute, deleteMessage);

export default router;
