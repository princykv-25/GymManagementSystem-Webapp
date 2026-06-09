const express = require("express");
const router = express.Router();
const Member = require("../models/Member");
const Trainer = require("../models/Trainer");
const Progress = require("../models/Progress");

router.post("/register", async (req, res) => {
  try {
    const member = new Member(req.body);
    await member.save();
    res.status(201).json({ message: "Member registered successfully", member });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const member = await Member.findOne({ email }).populate("trainer");

    if (!member) {
      return res.status(404).json({ error: "Member not found" });
    }

    if (member.password !== password) {
      return res.status(400).json({ error: "Invalid password" });
    }

    res.json({ message: "Member login successful", member });
  } catch (error) {
    res.status(500).json({ error: "Server error: " + error.message });
  }
});

router.post("/update-password", async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({ error: "Email and new password are required" });
    }

    const member = await Member.findOne({ email });
    if (!member) {
      return res.status(404).json({ error: "Member not found" });
    }

    member.password = newPassword;
    await member.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/:memberId/profile", async (req, res) => {
  try {
    const { name, phone, age, gender, address, height, weight, profileImage } = req.body;
    const existingMember = await Member.findById(req.params.memberId);

    if (!existingMember) {
      return res.status(404).json({ error: "Member not found" });
    }

    const updateData = {
      name,
      phone,
      age,
      gender,
      address,
    };

    if (profileImage !== undefined) {
      updateData.profileImage = profileImage;
    }

    const parsedHeight = height === "" || height === null || height === undefined ? null : Number(height);
    const parsedWeight = weight === "" || weight === null || weight === undefined ? null : Number(weight);

    updateData.height = parsedHeight;
    updateData.weight = parsedWeight;

    if (parsedHeight && parsedWeight) {
      const heightInMeters = parsedHeight / 100;
      updateData.bmi = Number((parsedWeight / (heightInMeters * heightInMeters)).toFixed(2));
    } else {
      updateData.bmi = null;
    }

    const member = await Member.findByIdAndUpdate(req.params.memberId, updateData, {
      new: true,
      runValidators: true,
    }).populate("trainer");

    const weightOrHeightChanged =
      parsedHeight &&
      parsedWeight &&
      (existingMember.height !== parsedHeight || existingMember.weight !== parsedWeight);

    if (weightOrHeightChanged) {
      await Progress.create({
        member: member._id,
        trainer: member.trainer?._id || undefined,
        weight: parsedWeight,
        height: parsedHeight,
        bmi: updateData.bmi,
        progressType: "Member Profile Update",
        notes: "Updated from member profile",
      });
    }

    res.json({ message: "Profile updated successfully", member });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const filter = {};

    if (req.query.trainerId) {
      filter.trainer = req.query.trainerId;
    }

    const members = await Member.find(filter)
      .populate("trainer")
      .sort({ joinDate: -1 });
    res.json(members);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/count", async (req, res) => {
  try {
    const count = await Member.countDocuments();
    res.json({ count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/latest", async (req, res) => {
  try {
    const latestMembers = await Member.find()
      .populate("trainer")
      .sort({ joinDate: -1 })
      .limit(5);
    res.json(latestMembers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/unassigned", async (req, res) => {
  try {
    const unassigned = await Member.find({
      $or: [{ trainer: { $exists: false } }, { trainer: null }],
    }).sort({ joinDate: -1 });
    res.json(unassigned);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:memberId", async (req, res) => {
  try {
    const member = await Member.findById(req.params.memberId).populate("trainer");

    if (!member) {
      return res.status(404).json({ error: "Member not found" });
    }

    res.json(member);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/:memberId/assign-trainer/:trainerId", async (req, res) => {
  try {
    const { memberId, trainerId } = req.params;
    const trainer = await Trainer.findById(trainerId);

    if (!trainer) {
      return res.status(404).json({ error: "Trainer not found" });
    }

    const member = await Member.findByIdAndUpdate(
      memberId,
      { trainer: trainerId },
      { new: true }
    ).populate("trainer");

    if (!member) {
      return res.status(404).json({ error: "Member not found" });
    }

    res.json({ message: "Trainer assigned successfully", member });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/:memberId/remove-trainer", async (req, res) => {
  try {
    const member = await Member.findByIdAndUpdate(
      req.params.memberId,
      { trainer: null },
      { new: true }
    ).populate("trainer");

    if (!member) {
      return res.status(404).json({ error: "Member not found" });
    }

    res.json({ message: "Trainer removed successfully", member });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/:memberId", async (req, res) => {
  try {
    const member = await Member.findByIdAndDelete(req.params.memberId);

    if (!member) {
      return res.status(404).json({ error: "Member not found" });
    }

    res.json({ message: "Member deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
