const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  member: { type: mongoose.Schema.Types.ObjectId, ref: "Member", required: true },
  trainer: { type: mongoose.Schema.Types.ObjectId, ref: "Trainer", default: null },
  title: { type: String, required: true, trim: true },
  details: { type: String, default: "", trim: true },
  assignedByRole: {
    type: String,
    enum: ["admin", "trainer"],
    required: true,
  },
  assignedById: { type: String, required: true },
  assignedByName: { type: String, required: true },
  dueDate: { type: Date, default: null },
  status: {
    type: String,
    enum: ["Pending", "In Progress", "Submitted", "Done"],
    default: "Pending",
  },
  memberProgress: { type: String, default: "", trim: true },
  reviewerNotes: { type: String, default: "", trim: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Task", taskSchema);
