import mongoose from "mongoose";

export const connectToDb = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB: ", conn.connection.host);
  } catch (e) {
    console.log("Connection failed to MongoDB:", e);
  }
};
