const express = require("express");
const router = express.Router();
const Member = require("../models/Member");

// Register a new member
router.post("/register", async (req, res) => {
  try {
    const member = new Member(req.body);
    await member.save();
    res.status(201).json({ message: "Member registered successfully", member });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all members
router.get("/", async (req, res) => {
  try {
    const members = await Member.find();
    res.json(members);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Assign a trainer to a member
router.put("/:memberId/assign-trainer/:trainerId", async (req, res) => {
  try {
    const { memberId, trainerId } = req.params;

    // Find member by ID and update trainer field
    const member = await Member.findByIdAndUpdate(
      memberId,
      { trainer: trainerId },
      { new: true }
    ).populate("trainer"); // 👈 include trainer details in response

    res.json({ message: "Trainer assigned successfully", member });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


module.exports = router;
