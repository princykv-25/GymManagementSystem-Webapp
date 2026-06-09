const express = require("express");
const router = express.Router();
const Admin = require("../models/Admin");

// ===== Register new admin (optional)
router.post("/register", async (req, res) => {
  try {
    const admin = new Admin(req.body);
    await admin.save();
    res.status(201).json({ message: "Admin registered successfully", admin });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ===== Admin login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });

    if (!admin) return res.status(404).json({ error: "Admin not found" });
    if (admin.hashed_password !== password)
      return res.status(400).json({ error: "Invalid password" });

    res.json({ message: "Admin login successful", admin });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const admins = await Admin.find().sort({ created_at: -1 });
    res.json(admins);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:adminId", async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.adminId);

    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
    }

    res.json(admin);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
