const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  age: { type: Number, required: true, min: 1 },
  gender: { type: String, enum: ["male", "female", "other"], required: true },
  address: { type: String, required: true },
  joinDate: { type: Date, default: Date.now },
  trainer: { type: mongoose.Schema.Types.ObjectId, ref: "Trainer" }

});

module.exports = mongoose.model("Member", memberSchema);
