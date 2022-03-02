import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
  author: { type: Object, require: true },
  text: { type: String, require: true },
  date: { type: String, require: true },
});

export default MessageSchema;
