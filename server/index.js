import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import cors from "cors";

const app = express();
dotenv.config();

const PORT = process.env.PORT || 500;

mongoose.set("strictQuery", false);
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    app.listen(PORT, () => console.log(`Server listening on port : ${PORT}`));
  })
  .catch((err) => console.log(`Error Connecting to Database : ${err.message}`));
