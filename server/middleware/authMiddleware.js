import jwt from "jsonwebtoken";
import User from "../model/userModel.js";

export const protect = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      res.status(401);
      throw new Error("Not authorized, please login");
    }

    const verified = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(verified.id).select("-password");

    if (!user) {
      res.status(401);
      throw new Error("User not found");
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(400);
    throw new Error("Not authorized, please login");
  }
};
