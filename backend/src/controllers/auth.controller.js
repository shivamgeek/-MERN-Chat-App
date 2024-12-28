import { generateToken } from "../lib/utils.js";
import User from "./../models/user.model.js";
import bcrypt from "bcrypt";
import cloudinary from "../lib/cloudinary.js";
import { sendJsonResponse } from "../lib/utils.js";

export const signup = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    if (!fullName || !email || !password) {
      return sendJsonResponse(res, 400, "Must have all fields");
    }
    if (password.length < 6) {
      return sendJsonResponse(res, 400, "password must be of 6 length");
    }
    const existingUser = User.findOne({ email });
    if (!existingUser) {
      return sendJsonResponse(res, 400, "User already exists");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
    });

    if (newUser) {
      // generate JWT token here
      const token = generateToken(newUser._id, res);
      newUser.jsonToken = token;
      await newUser.save();
      return sendJsonResponse(res, 201, "", newUser);
    } else {
      return sendJsonResponse(res, 400, "Invalid user data");
    }
  } catch (e) {
    console.log("error occurred during signup: ", e.message);
    return sendJsonResponse(res, 400, `error ${e.message}`);
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return sendJsonResponse(res, 404, "Invalid credentials");
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return sendJsonResponse(res, 404, "Invalid credentials");
    }

    generateToken(user.id, res);
    return sendJsonResponse(res, 200, "", user);
  } catch (e) {
    return sendJsonResponse(res, 404, `error happened during sign-in: ${e}`);
  }
};

export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    return sendJsonResponse(res, 200, "Successfully logged out!");
  } catch (e) {
    return sendJsonResponse(res, 404, `error happened during logout: ${e}`);
  }
};

export const updateProfile = async (req, res) => {
  const { profilePic } = req.body;

  if (!profilePic) {
    return sendJsonResponse(res, 404, "profile pic not present");
  }

  const uploadResponse = await cloudinary.uploader.upload(profilePic);

  const userId = req.user._id;
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    {
      profilePic: uploadResponse.secure_url,
    },
    { new: true }
  );

  return sendJsonResponse(res, 200, "", updatedUser);
};

export const checkAuth = (req, res) => {
  try {
    return sendJsonResponse(res, 200, "", req.user);
  } catch (e) {
    return sendJsonResponse(res, 500, `No user found corresponding to token`);
  }
};
