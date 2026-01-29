import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

export const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`);
    console.log(`\n MongDB connected !! DB HOST: $${connectionInstance.connection.host}` ); // need to study about the instance of DBinstance 
  } catch (error) {
    console.log("MONGO DB connection error", error);
    process.exit(1); // need to study about the process that it wil multiple port to exit the process on the multiple condition
  }
};
