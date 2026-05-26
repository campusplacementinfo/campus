const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    status: {
      type: String,
      enum: ["applied", "shortlisted", "rejected", "selected"],
      default: "applied"
    }
  },
  { timestamps: true }
);

applicationSchema.index({ job: 1 });
applicationSchema.index({ student: 1 });
applicationSchema.index({ status: 1 });
applicationSchema.index({ createdAt: -1 });
applicationSchema.index({ job: 1, student: 1 }, { unique: true, partialFilterExpression: { job: { $exists: true }, student: { $exists: true } } });

module.exports = mongoose.model("Application", applicationSchema);