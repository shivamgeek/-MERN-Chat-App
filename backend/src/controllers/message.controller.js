import { sendJsonResponse } from "../lib/utils.js";
import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";
import { io, getReceiverSocketId } from "../socket.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers =
      (await User.find({
        _id: { $ne: loggedInUserId },
      }).select("--password")) || [];

    return sendJsonResponse(res, 200, undefined, filteredUsers);
  } catch (e) {
    return sendJsonResponse(
      res,
      500,
      "error in getting users for sideBar:" + e.message
    );
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: otherUserId } = req.params;
    const myUserId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myUserId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: myUserId },
      ],
    });
    return sendJsonResponse(res, 200, undefined, messages);
  } catch (e) {
    return sendJsonResponse(
      res,
      500,
      "error in getting messages for user:" + e
    );
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const myUserId = req.user._id;

    const msg = await Message.findOne({ _id: messageId });

    if (msg.senderId.toString() !== myUserId.toString()) {
      throw new Error("Can't delete someone else's message");
    }
    await Message.deleteOne({ _id: messageId });
    return sendJsonResponse(res, 200, "deleted successfully");
  } catch (e) {
    return sendJsonResponse(
      res,
      500,
      "error in deleting message for user: " + e
    );
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl = undefined;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });
    await newMessage.save();

    // todo: realtime functionality using socket.io

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    return sendJsonResponse(res, 201, undefined, newMessage);
  } catch (e) {
    return sendJsonResponse(res, 500, "error in saving message for user:" + e);
  }
};
