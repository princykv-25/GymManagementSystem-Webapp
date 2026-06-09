const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  hashed_password: { type: String, required: true },
  profileImage: { type: String, default: "" },
  role: {
    type: String,
    enum: ["Super Admin", "Manager"],
    default: "Manager",
  },
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Admin", adminSchema);
