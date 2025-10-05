const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// Initialize app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Import routes BEFORE starting the server
const memberRoutes = require("./routes/memberRoutes");
app.use("/api/members", memberRoutes);

const trainerRoutes = require("./routes/trainerRoutes");
app.use("/api/trainers", trainerRoutes);

const attendanceRoutes = require("./routes/attendanceRoutes");
app.use("/api/attendance", attendanceRoutes);

const dietPlanRoutes = require("./routes/DietPlanRoutes");
app.use("/api/dietplans", dietPlanRoutes);

const progressRoutes = require("./routes/progressRoutes");
app.use("/api/progress", progressRoutes);


// Simple test route
app.get("/", (req, res) => {
  res.send("Gym Management System Backend Running ✅");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
