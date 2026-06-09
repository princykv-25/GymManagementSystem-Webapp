const express = require("express");
const router = express.Router();
const Progress = require("../models/Progress");

router.post("/", async (req, res) => {
  try {
    const { weight, height } = req.body;
    const heightInMeters = Number(height) / 100;
    const bmi = Number(weight) / (heightInMeters * heightInMeters);

    const progress = new Progress({
      ...req.body,
      bmi: Number(bmi.toFixed(2)),
    });

    await progress.save();
    res.status(201).json({ message: "Progress added successfully", progress });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/member/:memberId", async (req, res) => {
  try {
    const progress = await Progress.find({ member: req.params.memberId })
      .populate("trainer")
      .populate("member")
      .sort({ date: -1 });
    res.json(progress);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const allProgress = await Progress.find()
      .populate("member")
      .populate("trainer")
      .sort({ date: -1 });
    res.json(allProgress);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/trend/:memberId", async (req, res) => {
  try {
    const progressData = await Progress.find({ member: req.params.memberId })
      .sort({ date: 1 })
      .select("date weight -_id");

    const labels = progressData.map((item) =>
      new Date(item.date).toLocaleDateString("en-GB")
    );
    const weights = progressData.map((item) => item.weight);

    res.json({ labels, weights });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/count", async (req, res) => {
  try {
    const count = await Progress.countDocuments();
    res.json({ count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
