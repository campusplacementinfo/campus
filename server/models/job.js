const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  company: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  salary: {
    type: String,
    default: null
  },
  positions: {
    type: Number,
    default: 1,
    min: 1
  },
  eligibility: {
    type: String,
    default: null,
    trim: true
  },
  experience: {
    type: String,
    default: null,
    trim: true
  },
  skills: {
    type: [String],
    default: []
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  jobStatus: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  }
}, { timestamps: true });

jobSchema.index({ createdBy: 1 });
jobSchema.index({ jobStatus: 1 });
jobSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Job", jobSchema);