const mongoose = require('mongoose');
const Member = require('./Member');

const attendanceSchema = new mongoose.Schema({

    member: { type: mongoose.Schema.Types.ObjectId, ref: "Member" , required: true},
    trainer: { type: mongoose.Schema.Types.ObjectId, ref: "Trainer" },
    date: {type: Date, default: Date.now},
    status: {type: String, enum: ["Present", "Absent"], required: true}


});

module.exports = mongoose.model("Attendance", attendanceSchema);