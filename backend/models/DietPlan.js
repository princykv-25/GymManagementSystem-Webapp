const mongoose = require('mongoose');


const dietPlanSchema = new mongoose.Schema({

    member: { type: mongoose.Schema.Types.ObjectId, ref: "Member" , required: true},
    trainer: { type: mongoose.Schema.Types.ObjectId, ref: "Trainer", required:true },
    goal: {type: String, enum: ["Weight Loss","Muscle Gain","Fitness"], required: true},
    planDetails: {type: String, required: true},
    createdAT: {type: Date, default: Date.now}

});

module.exports = mongoose.model("DietPlan", dietPlanSchema);