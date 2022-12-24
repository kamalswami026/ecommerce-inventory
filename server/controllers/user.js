import User from "../model/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Token from "../model/tokenModel.js";
import crypto from "crypto";
import { sendEmail } from "../utils/sendEmail.js";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400);
      throw new Error("Fill all the required fields");
    }

    const userExist = await User.findOne({ email });
    if (userExist) {
      res.status(400);
      throw new Error("User already exist!");
    }

    const user = await User.create({
      name,
      email,
      password,
    });

    if (user) {
      const token = generateToken(user._id);

      res.cookie("token", token, {
        path: "/",
        httpOnly: true,
        expires: new Date(Date.now() + 1000 * 86400), //1 day
        sameSite: "none",
        secure: true,
      });

      const { _id, name, email, photo, phone, bio } = user;
      res.status(201).json({
        _id,
        name,
        email,
        photo,
        bio,
        phone,
        token,
      });
    } else {
      res.status(400);
      throw new Error("Failed to Signup, Please try again later");
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      throw new Error("Invalid email or password");
    }

    const user = await User.findOne({ email });

    if (!user) {
      res.status(400);
      throw new Error("User doesn't exist! please signup");
    }

    const isPasswordCorrect = bcrypt.compare(password, user.password);

    if (user && isPasswordCorrect) {
      const token = generateToken(user._id);

      res.cookie("token", token, {
        path: "/",
        httpOnly: true,
        expires: new Date(Date.now() + 1000 * 86400), //1 day
        sameSite: "none",
        secure: true,
      });

      const { _id, name, email, photo, phone, bio } = user;
      res.status(200).json({
        _id,
        name,
        email,
        photo,
        bio,
        phone,
      });
    } else {
      res.satus(400);
      throw new Error("Invalid email or password");
    }
  } catch (err) {
    res.status(400);
    throw new Error("Failed to login");
  }
};

export const logout = async (req, res) => {
  try {
    res.cookie("token", "", {
      path: "/",
      httpOnly: true,
      expires: new Date(0),
      sameSite: "none",
      secure: true,
    });

    res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    res.status(400);
    throw new Error("Failed to logout");
  }
};

export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      const { _id, name, email, photo, phone, bio } = user;
      res.status(200).json({
        _id,
        name,
        email,
        photo,
        bio,
        phone,
      });
    }
  } catch (err) {
    res.status(401);
    throw new Error("Failed to get user");
  }
};

export const loginStatus = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.json(false);
    }
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    if (verified) return res.json(true);
    return res.json(false);
  } catch (err) {
    res.status(401);
    throw new Error("");
  }
};

export const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      const { name, email, photo, phone, bio } = user;
      user.email = email;
      user.name = req.body.name || name;
      user.phone = req.body.phone || phone;
      user.bio = req.body.bio || bio;
      user.photo = req.body.photo || photo;

      const updatedUser = await user.save();
      res.status(201).json({
        _id: updateUser._id,
        name: updateUser.name,
        email: updateUser.email,
        phone: updateUser.phone,
        photo: updateUser.photo,
        bio: updateUser.bio,
      });
    } else {
      res.status(402);
      throw new Error("User not found");
    }
  } catch (err) {
    res.status(402);
    throw new Error("Failed to update");
  }
};

export const changePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const { oldPassword, password } = req.body;

    if (!user) {
      res.status(404);
      throw new Error("User not found, please Signup");
    }

    if (!oldPassword || !password) {
      res.status(404);
      throw new Error("Please enter old and new password");
    }

    const isPasswordMatch = await bcrypt.compare(oldPassword, user.password);

    if (user && isPasswordMatch) {
      user.password = password;
      await user.save();
      res.send("Password changed successfully");
    } else {
      res.satus(200);
      throw new Error("Old password is incorrect");
    }
  } catch (err) {
    res.status(402);
    throw new Error("Failed to update password");
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      res.status(404);
      throw new Error("User doesn't exist");
    }

    let token = await Token.findOne({ userId: user._id });
    if (token) await token.deleteOne();

    let resetToken = crypto.randomBytes(32).toString("hex") + user._id;
    const hashedtoken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    //save token to database
    await new Token({
      userId: user._id,
      token: hashedtoken,
      createdAt: Date.now(),
      expiresAt: Date.now() + 30 * (60 * 1000), //Thirty Minutes
    }).save();

    const resetUrl = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`;

    //const email design
    const message = `
      <h2>${user.name}</h2>
      <p>Please use the link below to reset your password</p>
      <p>This link is valid for 30 minutes</p>
      <a href=${resetUrl} clicktracking=off>Click here to change password</a>
      <p>Regards...</p>
      <p>3Chairs Pvt. Ltd.</p>
    `;

    const subject = "Password Reset Request";
    const send_to = user.email;
    const sent_from = process.env.EMAIL_USER;

    try {
      await sendEmail(subject, message, send_to, sent_from);
      res.status(200).json({ success: true, message: "Reset Email Sent" });
    } catch (err) {
      res.status(500);
      throw new Error(
        "There was a problem sending the email, please try again later"
      );
    }
  } catch (err) {
    res.status(404);
    throw new Error("Oops! Something went wrong");
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { password } = req.body;
    const { resetToken } = req.params;

    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    const userToken = await Token.findOne({
      token: hashedToken,
      expiresAt: { $gt: Date.now() },
    });

    if (!userToken) {
      res.status(404);
      throw new Error("Link expired");
    }

    const user = await User.findOne({ _id: userToken.userId });
    user.password = password;
    await user.save();

    res.status(200).json({
      message: "Password Reset Successful, Please Login",
    });
  } catch (err) {
    res.status(404);
    throw new Error("Failed to update passwords");
  }
};
