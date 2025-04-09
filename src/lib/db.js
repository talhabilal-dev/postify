import mongoose from "mongoose";

const connection = {};
const connectDB = async () => {
  if (connection.isConnected) {
    console.log("Using existing connection");
    return;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    connection.isConnected = conn.connections[0].readyState;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(error);
    throw new Error("Failed to connect to MongoDB");
  }
};

export default connectDB;
