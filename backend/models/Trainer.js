const mongoose = require("mongoose");

const trainerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  specialization: {
    type: [
      {
        type: String,
        enum: ["Yoga", "Cardio", "Weight Training", "Zumba"],
      },
    ],
    required: true,
    validate: {
      validator: (value) => Array.isArray(value) && value.length > 0,
      message: "At least one specialization is required",
    },
  },
  experience: { type: Number, required: true, min: 0 },
  bio: { type: String, default: "" },
  profileImage: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Trainer", trainerSchema);
