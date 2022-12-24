import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Enter your name"],
    },
    email: {
      type: String,
      required: [true, "Enter your email"],
      unique: true,
      trim: true,
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        "Enter a valid email ",
      ],
    },
    password: {
      type: String,
      required: [true, "Enter a password"],
      minLength: [6, "Password must be at least 6 characters"],
    },
    photo: {
      type: String,
      required: [true, "Please add a photo"],
      default:
        "https://www.google.com/url?sa=i&url=https%3A%2F%2Fdeejayfarm.com%2Ftechnicalexperts%2Fdefault-avatar-profile-icon-4%2F&psig=AOvVaw0Rlze_E5_cTAdLTVaUwiK2&ust=1671855656632000&source=images&cd=vfe&ved=0CBAQjRxqFwoTCPCkwObxjvwCFQAAAAAdAAAAABAE",
    },
    phone: {
      type: String,
      default: "+91",
    },
    bio: {
      type: String,
      default: "bio",
      maxLenght: [250, "Bio must not be more than 250 letters"],
    },
  },
  { timestamps: true }
);

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(this.password, salt);
  this.password = hashedPassword;
  next();
});

const User = mongoose.model("User", UserSchema);

export default User;
