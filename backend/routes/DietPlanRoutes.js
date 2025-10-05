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





module.exports = router;
