const mongoose = require("mongoose");

const trainerSchema = new mongoose.Schema({

    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    phone: {type: String, required:true},
    password: {type: String, required: true},
    specialization: {type: String, required: true},
    experience: {type: Number, required: true,min: 0},
    createdAt: {type: Date, default: Date.now}


})

module.exports = mongoose.model("Trainer", trainerSchema);
