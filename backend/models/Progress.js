const mongoose = require("mongoose");

const progressSchema = new mongoose.Schema({

    member: { type: mongoose.Schema.Types.ObjectId, ref: "Member" , required: true},
    trainer: { type: mongoose.Schema.Types.ObjectId, ref: "Trainer", required:true },
    date: {type: Date, default: Date.now},
    weight: {type: Number, required: true},
    height: {type: Number, required: true},
    bmi: {type: Number, required: true},
    notes: {type: String },
    progressType: {type: String, required: true},

});

module.exports = mongoose.model("Progress", progressSchema);
