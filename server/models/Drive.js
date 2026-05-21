const mongoose = require("mongoose");

const drivesSchema = new mongoose.Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  salary: Number,
  location: String,
  eligibility: String,
  positions: Number,
  applicationDeadline: Date,
  status: {
    type: String,
    enum: ["active", "closed", "upcoming"],
    default: "active"
  },
  selectedStudents: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Drive", drivesSchema);
