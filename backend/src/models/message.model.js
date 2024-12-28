import mongoose, { mongo } from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      required: true,
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    receiverId: {
      required: true,
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    senderId: {
      required: true,
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    text: {
      type: String,
    },
    image: {
      type: String,
    },
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);

export default Message;
