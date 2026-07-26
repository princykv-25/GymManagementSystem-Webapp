const express = require("express");
const router = express.Router();
const DietPlan = require("../models/DietPlan");
const Member = require("../models/Member");

// Add a diet plan
router.post("/", async (req, res) => {
  try {
    const dietplan = new DietPlan(req.body);
    await dietplan.save();
    res.status(201).json({ message: "Diet Plan added successfully", dietplan });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get member by  memberid
router.get("/member/:memberId", async (req, res) => {
  try {
    const dietplans = await DietPlan.find( {member: req.params.memberId}).populate("trainer");
    res.json(dietplans);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all members
router.get("/", async (req, res) => {
  try {
    const dietplans = await DietPlan.find().populate("member").populate("trainer");
    res.json(dietplans);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/count", async (req, res) => {
  try {
    const count = await DietPlan.countDocuments();
    res.json({ count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update diet plan
router.put("/:id", async (req, res) => {
  try {
    const dietplan = await DietPlan.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("member").populate("trainer");
    if (!dietplan) return res.status(404).json({ error: "Diet plan not found" });
    res.json({ message: "Diet plan updated successfully", dietplan });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete diet plan
router.delete("/:id", async (req, res) => {
  try {
    const dietplan = await DietPlan.findByIdAndDelete(req.params.id);
    if (!dietplan) return res.status(404).json({ error: "Diet plan not found" });
    res.json({ message: "Diet plan deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

