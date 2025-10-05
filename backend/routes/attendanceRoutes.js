const express = require("express");
const router = express.Router();
const Attendance = require("../models/Attendance");

// Mark attendance
router.post("/mark", async (req, res) => {
  try {
    const attendance = new Attendance(req.body);
    await attendance.save();
    res.status(201).json({ message: "Attendnace marked successfully", attendance });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all attendance records
router.get("/", async (req, res) => {
  try {
    const attendance = await Attendance.find().populate("member").populate("trainer");
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/member/:memberId", async (req, res) => {
  try {
    const attendance = await Attendance.find({ member: req.params.memberId })
      .populate("member")
      .populate("trainer");
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/date/:date", async (req, res) => {
  try {
    const date = new Date(req.params.date);
    const nextDay = new Date(date);
    nextDay.setDate(date.getDate() + 1);

    const attendance = await Attendance.find({
      date: { $gte: date, $lt: nextDay }
    })
      .populate("member")
      .populate("trainer");

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



module.exports = router;
