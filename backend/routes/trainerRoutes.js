const express = require("express");
const router = express.Router();
const Trainer = require("../models/Trainer");

router.post("/register", async (req, res) => {
  try {
    const trainer = new Trainer(req.body);
    await trainer.save();
    res.status(201).json({ message: "trainer registered successfully", trainer });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all trainers
router.get("/", async (req, res) => {
  try {
    const trainers = await Trainer.find();
    res.json(trainers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;