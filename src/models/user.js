import mongoose from "mongoose";

export const User = mongoose.model("Users", {
  email: String,
  password: String,
});

const UserSchema = new mongoose.Schema({
  email: { type: String, require: true },
  password: { type: String, require: true },
});

export default UserSchema;
