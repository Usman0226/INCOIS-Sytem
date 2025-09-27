const mongoose = require("mongoose");

const verifiedReportSchema = new mongoose.Schema(
  {
    hazardType: { type: String, required: true },
    text: { type: String, required: true },
    image_url: { type: [String], default: [] },
    video_url: { type: [String], default: [] },
    lat: Number,
    lon: Number,

    validatedBy: { type: String, required: true },
    validatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const VerifiedReport = mongoose.model("VerifiedReport", verifiedReportSchema);
module.exports = VerifiedReport;
