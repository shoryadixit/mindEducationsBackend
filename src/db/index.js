import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";

export const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    const connectionInstance = await mongoose.connect(
      `${mongoURI.replace("myPassword", "Shorya1234")}/${DB_NAME}`
    );
    console.log("MongoDB Connection Instance", connectionInstance);
  } catch (error) {
    console.log("Error in Connection", error);
    process.exit(1);
  }
};
