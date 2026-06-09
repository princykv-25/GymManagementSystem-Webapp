const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  senderRole: {
    type: String,
    enum: ["admin", "trainer", "member"],
    required: true,
  },
  senderId: { type: String, required: true },
  senderName: { type: String, required: true },
  recipientRole: {
    type: String,
    enum: ["admin", "trainer", "member"],
    required: true,
  },
  recipientId: { type: String, required: true },
  recipientName: { type: String, required: true },
  content: { type: String, required: true, trim: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Message", messageSchema);
