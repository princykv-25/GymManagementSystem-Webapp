const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Admin = require("./models/Admin");
const Trainer = require("./models/Trainer");
const Member = require("./models/Member");
const Attendance = require("./models/Attendance");
const DietPlan = require("./models/DietPlan");
const Progress = require("./models/Progress");
const Message = require("./models/Message");
const Task = require("./models/Task");

dotenv.config();

async function seedData() {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/gym_management");
    console.log("Connected to MongoDB for seeding...");

    // Clear existing collections
    await Admin.deleteMany({});
    await Trainer.deleteMany({});
    await Member.deleteMany({});
    await Attendance.deleteMany({});
    await DietPlan.deleteMany({});
    await Progress.deleteMany({});
    await Message.deleteMany({});
    await Task.deleteMany({});

    console.log("Cleared old data.");

    // Create Admin
    const admin = await Admin.create({
      name: "System Admin",
      email: "admin@gym.com",
      phone: "9876543210",
      hashed_password: "admin123",
      role: "Super Admin",
    });
    console.log("Created Admin: admin@gym.com / admin123");

    // Create Trainers
    const trainer1 = await Trainer.create({
      name: "Bonymol Baby",
      email: "bonymol@gym.com",
      phone: "9846426438",
      password: "trainer123",
      specialization: ["Weight Training", "Cardio"],
      experience: 4,
      bio: "Certified fitness coach specializing in weight management and personal training.",
    });

    const trainer2 = await Trainer.create({
      name: "Rahul Sharma",
      email: "rahul@gym.com",
      phone: "9812345678",
      password: "trainer123",
      specialization: ["Yoga", "Zumba"],
      experience: 3,
      bio: "Wellness instructor focused on flexibility, posture, and cardiovascular health.",
    });
    console.log("Created Trainers: bonymol@gym.com, rahul@gym.com / trainer123");

    // Create Members
    const member1 = await Member.create({
      name: "Princy K V",
      email: "princy@gym.com",
      phone: "8118008557",
      password: "member123",
      age: 22,
      gender: "female",
      address: "Kannur, Kerala",
      height: 165,
      weight: 58,
      bmi: 21.3,
      trainer: trainer1._id,
    });

    const member2 = await Member.create({
      name: "John Doe",
      email: "john@gym.com",
      phone: "9800011122",
      password: "member123",
      age: 25,
      gender: "male",
      address: "MG Road, Kochi",
      height: 178,
      weight: 75,
      bmi: 23.67,
      trainer: trainer1._id,
    });

    const member3 = await Member.create({
      name: "Sriya Doe",
      email: "sriya@gym.com",
      phone: "9899988877",
      password: "member123",
      age: 21,
      gender: "female",
      address: "Kottayam, Kerala",
      height: 160,
      weight: 52,
      bmi: 20.31,
      trainer: trainer2._id,
    });
    console.log("Created Members: princy@gym.com, john@gym.com, sriya@gym.com / member123");

    // Create Diet Plans
    await DietPlan.create({
      member: member1._id,
      trainer: trainer1._id,
      goal: "Fitness",
      planDetails: "Morning: Oatmeal & Eggs. Lunch: Brown rice, chicken/tofu & salad. Evening: Green tea & almonds. Dinner: Grilled fish/paneer & veggies.",
    });

    await DietPlan.create({
      member: member2._id,
      trainer: trainer1._id,
      goal: "Muscle Gain",
      planDetails: "High protein intake: 4 meals daily with whey protein, chicken breast, rice, sweet potatoes, and peanut butter toast.",
    });

    // Create Progress records
    await Progress.create({
      member: member1._id,
      trainer: trainer1._id,
      weight: 60,
      height: 165,
      bmi: 22.04,
      progressType: "Initial Assessment",
      notes: "Baseline measurements taken upon joining.",
    });

    await Progress.create({
      member: member1._id,
      trainer: trainer1._id,
      weight: 58,
      height: 165,
      bmi: 21.3,
      progressType: "Monthly Check-in",
      notes: "Improved stamina and 2kg weight loss achieved.",
    });

    // Create Attendance
    await Attendance.create({
      member: member1._id,
      trainer: trainer1._id,
      date: new Date(),
      status: "Present",
    });

    await Attendance.create({
      member: member2._id,
      trainer: trainer1._id,
      date: new Date(),
      status: "Present",
    });

    // Create Messages
    await Message.create({
      senderRole: "trainer",
      senderId: trainer1._id.toString(),
      senderName: trainer1.name,
      recipientRole: "member",
      recipientId: member1._id.toString(),
      recipientName: member1.name,
      content: "Hi Princy, welcome! Please check your personalized diet plan and update your progress.",
    });

    // Create Tasks
    await Task.create({
      member: member1._id,
      trainer: trainer1._id,
      title: "Daily 30-min Cardio Session",
      details: "Complete 20 minutes treadmill running + 10 minutes cycling.",
      assignedByRole: "trainer",
      assignedById: trainer1._id.toString(),
      assignedByName: trainer1.name,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: "In Progress",
    });

    console.log("Seeding complete! All sample data inserted successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
}

seedData();
