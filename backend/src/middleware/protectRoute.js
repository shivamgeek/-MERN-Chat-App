import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { sendJsonResponse } from "../lib/utils.js";

export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    if (!token) {
      return sendJsonResponse(
        res,
        409,
        "Unauthorized: Token not found in request"
      );
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return sendJsonResponse(res, 401, "Unauthorized: Invalid token");
    }
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return sendJsonResponse(res, 404, "User not found for token");
    }
    req.user = user;
    next();
  } catch (e) {
    return sendJsonResponse(res, 404, `Error in protectRoute: ${e}`);
  }
};
