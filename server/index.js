import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import cors from "cors";
import userRoutes from "./routes/user.js";
import { errorHandler } from "./middleware/errorMiddleware.js";
import cookieParser from "cookie-parser";

const app = express();
dotenv.config();

// MIDDLEWARE
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

// ROUTES
app.use("/users", userRoutes);

// ERROR HANDLER
app.use(errorHandler);

const PORT = process.env.PORT || 500;

mongoose.set("strictQuery", false);
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    app.listen(PORT, () => console.log(`Server listening on port : ${PORT}`));
  })
  .catch((err) => console.log(`Error Connecting to Database : ${err.message}`));
