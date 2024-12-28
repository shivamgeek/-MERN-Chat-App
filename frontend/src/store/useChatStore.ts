// @ts-nocheck
import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { AuthUser, useAuthStore } from "./useAuthStore.ts";

type Message = {
  _id: string;
  text: string;
  senderId: string;
  createdAt: Date;
  image: string;
};

interface IUseChatStore {
  messages: Message[];
  users: AuthUser[];
  selectedUser: AuthUser | null;
  isUsersLoading: boolean;
  isMessagesLoading: boolean;
  getUsers: () => void;
  getMessages: (userId: string) => void;
  sendMessage: ({ text, image }: { text: string; image: string }) => void;
  setSelectedUser: (selectedUser: AuthUser) => void;
  deleteMessage: (messageId: string) => void;
  subscribeToMessages: () => void;
  unsubscribeToMessages: () => void;
}

export const useChatStore = create<IUseChatStore>((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  getUsers: async () => {
    try {
      set({ isUsersLoading: false });
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },
  getMessages: async (userId: string) => {
    try {
      set({ isMessagesLoading: false });
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },
  setSelectedUser: (selectedUser: AuthUser) => set({ selectedUser }),
  sendMessage: async (content) => {
    try {
      const { selectedUser, messages } = get();

      const res = await axiosInstance.post(
        `/messages/send/${selectedUser?._id}`,
        content
      );
      set({ messages: [...messages, res.data.data] });
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },
  deleteMessage: async (messageId) => {
    try {
      const { messages } = get();
      await axiosInstance.delete(`/messages/${messageId}`);
      set({ messages: messages.filter((m) => m._id !== messageId) });
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },
  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) {
      return;
    }
    const socket = useAuthStore.getState().socket;

    socket.on("newMessage", (newMessage) => {
      if (newMessage.senderId !== selectedUser._id) {
        return;
      }
      set({ messages: [...get().messages, newMessage] });
    });
  },
  unsubscribeToMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },
}));
