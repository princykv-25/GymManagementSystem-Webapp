const express = require("express");
const router = express.Router();
const Trainer = require("../models/Trainer");
const Member = require("../models/Member");

router.post("/register", async (req, res) => {
  try {
    const trainer = new Trainer(req.body);
    await trainer.save();
    res.status(201).json({ message: "Trainer registered successfully", trainer });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const trainers = await Trainer.find().sort({ createdAt: -1 });
    res.json(trainers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const trainer = await Trainer.findOne({ email, password });

    if (!trainer) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    res.json({ message: "Login successful", trainer });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/update-password", async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({ error: "Email and new password are required" });
    }

    const trainer = await Trainer.findOne({ email });
    if (!trainer) {
      return res.status(404).json({ error: "Trainer not found" });
    }

    trainer.password = newPassword;
    await trainer.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/:trainerId/profile", async (req, res) => {
  try {
    const { name, phone, specialization, experience, bio, profileImage } = req.body;

    const trainer = await Trainer.findByIdAndUpdate(
      req.params.trainerId,
      {
        name,
        phone,
        specialization,
        experience,
        bio,
        ...(profileImage !== undefined ? { profileImage } : {}),
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!trainer) {
      return res.status(404).json({ error: "Trainer not found" });
    }

    res.json({ message: "Trainer profile updated successfully", trainer });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/count", async (req, res) => {
  try {
    const count = await Trainer.countDocuments();
    res.json({ count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:trainerId", async (req, res) => {
  try {
    const trainer = await Trainer.findById(req.params.trainerId);

    if (!trainer) {
      return res.status(404).json({ error: "Trainer not found" });
    }

    res.json(trainer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/:trainerId", async (req, res) => {
  try {
    const trainer = await Trainer.findByIdAndDelete(req.params.trainerId);

    if (!trainer) {
      return res.status(404).json({ error: "Trainer not found" });
    }

    await Member.updateMany({ trainer: req.params.trainerId }, { trainer: null });

    res.json({ message: "Trainer deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
