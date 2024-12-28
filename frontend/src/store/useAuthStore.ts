// @ts-nocheck
import { create } from "zustand";
import { axiosInstance } from "./../lib/axios.ts";
import toast from "react-hot-toast";
import io, { Socket } from "socket.io-client";

const BASE_SERVER_URL =
  import.meta.env.MODE === "production" ? "/" : "http://localhost:5001";

export type AuthUser = {
  _id: string;
  fullName: string;
  email: string;
  profilePic: string;
  createdAt: string;
};

interface IAuthStore {
  authUser: null | AuthUser;
  isSigningUp: boolean;
  isLoggingIn: boolean;
  isUpdatingProfile: boolean;
  isCheckingAuth: boolean;
  onlineUsers: string[];
  socket: Socket;
  checkAuth: () => void;
  signup: ({
    fullName,
    email,
    password,
  }: {
    fullName: string;
    email: string;
    password: string;
  }) => void;
  logout: () => void;
  login: ({ email, password }: { email: string; password: string }) => void;
  updateProfile: (data: object) => void;
  connectSocket: () => void;
  disconnectSocket: () => void;
}

export const useAuthStore = create<IAuthStore>((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,
  checkAuth: async () => {
    try {
      const resp = await axiosInstance.get("/auth/check");
      set({ authUser: resp.data.data });
      get().connectSocket();
    } catch (e) {
      console.log("Error in checkAuth: ", e);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },
  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data.data });
      toast.success("Account created successfully!");
    } catch (error: unknown) {
      toast.error(error.response.data.message);
    } finally {
      set({ isSigningUp: false });
    }
  },
  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out successfully");
      get().disconnectSocket();
    } catch (error: unknown) {
      toast.error(error.response.data.message);
    }
  },
  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data.data });
      toast.success("Logged in successfully!");

      get().connectSocket();
    } catch (error: unknown) {
      toast.error(error.response.data.message);
    } finally {
      set({ isLoggingIn: false });
    }
  },
  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.post("/auth/update-profile", data);
      set({ authUser: res.data.data });
      toast.success("Profile pic updated successfully!");
    } catch (error: unknown) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUpdatingProfile: false });
    }
  },
  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) {
      return;
    }
    const socket = io(BASE_SERVER_URL, {
      query: {
        userId: authUser._id,
      },
    });
    socket.connect();
    set({ socket });
    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });
  },
  disconnectSocket: () => {
    if (get().socket?.connected) {
      get().socket.disconnect();
    }
  },
}));
