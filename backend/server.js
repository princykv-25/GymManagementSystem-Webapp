const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

const memberRoutes = require("./routes/memberRoutes");
const trainerRoutes = require("./routes/trainerRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const dietPlanRoutes = require("./routes/DietPlanRoutes");
const progressRoutes = require("./routes/progressRoutes");
const adminRoutes = require("./routes/adminRoutes");
const messageRoutes = require("./routes/messageRoutes");

app.use("/api/members", memberRoutes);
app.use("/api/trainers", trainerRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/dietplans", dietPlanRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/admins", adminRoutes);
app.use("/api/messages", messageRoutes);

app.get("/", (req, res) => {
  res.send("Gym Management System Backend Running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
