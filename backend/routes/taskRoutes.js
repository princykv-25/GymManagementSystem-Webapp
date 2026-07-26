const express = require("express");
const router = express.Router();
const Task = require("../models/Task");
const Member = require("../models/Member");

router.post("/", async (req, res) => {
  try {
    const task = new Task(req.body);
    await task.save();
    const populated = await Task.findById(task._id).populate("member").populate("trainer");
    res.status(201).json({ message: "Task created successfully", task: populated });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const { role, userId } = req.query;
    let filter = {};

    if (role === "member") {
      filter.member = userId;
    } else if (role === "trainer") {
      filter.$or = [{ trainer: userId }, { assignedByRole: "trainer", assignedById: userId }];
    }

    const tasks = await Task.find(filter)
      .populate("member")
      .populate("trainer")
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/:taskId/member-progress", async (req, res) => {
  try {
    const { memberProgress } = req.body;
    const task = await Task.findByIdAndUpdate(
      req.params.taskId,
      {
        memberProgress,
        status: memberProgress ? "Submitted" : "In Progress",
      },
      { new: true }
    )
      .populate("member")
      .populate("trainer");

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json({ message: "Task progress updated successfully", task });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/:taskId/status", async (req, res) => {
  try {
    const { status, reviewerNotes } = req.body;
    const task = await Task.findByIdAndUpdate(
      req.params.taskId,
      { status, reviewerNotes },
      { new: true }
    )
      .populate("member")
      .populate("trainer");

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json({ message: "Task status updated successfully", task });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
