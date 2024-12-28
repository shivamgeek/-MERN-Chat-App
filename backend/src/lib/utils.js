import jwt from "jsonwebtoken";

export const generateToken = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
  res.cookie("jwt", token, {
    maxAge: 2 * 60 * 60 * 1000, // 7 * 24 * 60 * 60 * 1000, // MS
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV !== "development",
  });
  return token;
};

export const sendJsonResponse = (
  res,
  code,
  message = undefined,
  data = undefined
) => {
  return res.status(code).json({ message, data });
};
