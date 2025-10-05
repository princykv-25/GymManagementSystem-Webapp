const express = require("express");
const router = express.Router();
const Progress = require("../models/Progress");

// Add a Progress


router.post("/", async (req, res) => {
  try {
    const { weight, height } = req.body;

    // convert height from cm to meters
    const heightInMeters = height/100;

    // calculate BMI
    const bmi = weight/(heightInMeters*heightInMeters);

    // create progress record with BMI included
    const progress = new Progress({
      ...req.body,
      bmi: bmi
    });

    await progress.save();
    res.status(201).json({ message: "Progress added successfully", progress });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


// Get member by  memberid
router.get("/member/:memberId", async (req, res) => {
  try {
    const progress = await Progress.find( {member: req.params.memberId}).populate("trainer").populate("member");
    res.json(progress);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all members
router.get("/", async (req, res) => {
  try {
    const allProgress = await Progress.find().populate("member").populate("trainer");
    res.json(allProgress);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});





module.exports = router;
