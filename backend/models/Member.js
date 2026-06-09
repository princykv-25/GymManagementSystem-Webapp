const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  age: { type: Number, required: true, min: 1 },
  gender: { type: String, enum: ["male", "female", "other"], required: true },
  address: { type: String, required: true },
  height: { type: Number, min: 1, default: null },
  weight: { type: Number, min: 1, default: null },
  bmi: { type: Number, min: 0, default: null },
  profileImage: { type: String, default: "" },
  joinDate: { type: Date, default: Date.now },
  trainer: { type: mongoose.Schema.Types.ObjectId, ref: "Trainer", default: null }

});

module.exports = mongoose.model("Member", memberSchema);
