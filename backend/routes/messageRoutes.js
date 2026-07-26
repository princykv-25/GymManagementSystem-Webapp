const express = require("express");
const router = express.Router();
const Message = require("../models/Message");

router.post("/", async (req, res) => {
  try {
    const message = new Message(req.body);
    await message.save();
    res.status(201).json({ message: "Message sent successfully", data: message });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/count", async (req, res) => {
  try {
    const { role, userId } = req.query;
    const count = await Message.countDocuments({
      recipientRole: role,
      recipientId: userId,
    });

    res.json({ count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const { role, userId } = req.query;
    const messages = await Message.find({
      $or: [
        { senderRole: role, senderId: userId },
        { recipientRole: role, recipientId: userId },
      ],
    }).sort({ createdAt: -1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
