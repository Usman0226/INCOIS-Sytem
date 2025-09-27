const VerifiedReport = require("../models/verifiedReports");
const Report = require("../models/report");


async function serveReports(req, res) {
  try {
    const items = await Report.find({}).sort({ createdAt: -1 })

    // change this to absolute path (Over here..........)
    const mapped = items.map((r) => ({
      _id: r._id,
      text: r.text,
      lat: r.lat,
      lon: r.lon,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      image_url: Array.isArray(r.image_url)
        ? r.image_url.map(
            (f) => `${req.protocol}://${req.get("host")}/uploads/${f}`
          )
        : [],
      video_url: Array.isArray(r.video_url)
        ? r.video_url.map(
            (f) => `${req.protocol}://${req.get("host")}/uploads/${f}`
          )
        : [],
    }));

    return res.json({ data: mapped });
  } catch (err) {
    console.error("Error fetching reports:", err);
    return res.status(500).json({ message: "Failed to fetch reports" });
  }
}

const verifyReports = async (req, res) => {
  try {
    const { validatedBy } = req.body;

    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ error: "Report not found" });

    const verified = new VerifiedReport({
      hazardType: report.hazardType,
      text: report.text,
      image_url: report.image_url,
      video_url: report.video_url,
      lat: report.lat,
      lon: report.lon,
      validatedBy,
    });
    await verified.save();

    // Delete from pending reports
    await Report.findByIdAndDelete(req.params.id);

    res.json(verified);
  } catch (err) {
    console.error("Verify error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
    serveReports,
    verifyReports
};
