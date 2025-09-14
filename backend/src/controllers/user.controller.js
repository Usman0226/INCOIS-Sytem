// const Report = require("../models/report");

// const validateReport = async (req, res) => {
//   const { text, image_url, video_url, lat, lon } = req.body;

//   const reportData = {
//     text: text,
//     image_url: image_url,
//     video_url: video_url,
//     lat: lat,
//     lon: lon,
//   };

//   if (!text && !image_url) {
//     return res.status(400).json({ message: "Image and text are necessary !  " });
//   }

//   if (!video_url || !lat || !lon) {
//     return res
//       .status(400)
//       .json({ message: "Insufficeint data to submit report !" });
//   }

// //   const dups = Report.find({
// //     lat,
// //     lon,
// //   });


//   await Report.create(reportData);

//   console.log("Report saved ! ");
//   console.log(reportData);

//   res
//     .status(201)
//     .json({ message: "Report sumitted successfully", data: reportData });
// };

// module.exports = validateReport;




const Report = require("../models/report");
const axios = require("axios");

const validateReport = async (req, res) => {
  try {
    const { text, image_url, video_url, lat, lon } = req.body;

    if (!text && !image_url) {
      return res.status(400).json({ message: "Image or text is required!" });
    }
    if (!lat || !lon) {
      return res.status(400).json({ message: "Coordinates are required!" });
    }

    let reportData = { text, image_url, video_url, lat, lon };

    // Step 1: Cross-Modal Consistency
    if (text && image_url) {
      const consistency = await axios.post(process.env.CONSISTENCY_API_URL, { text, image_url });
      reportData.consistency_score = consistency.data.score;
    }

    // Step 2: Satellite Imagery Verification
    if (isHighPriority(reportData)) {
      const satCheck = await checkSatelliteChange(lat, lon);
      reportData.satellite_change = satCheck;
    }

    if (text) {
      const styleCheck = await axios.post(process.env.STYLOMETRY_API_URL, { text });
      reportData.stylometry_flag = styleCheck.data.is_fake;
    }

    if (containsDisasterClaim(text)) {
      const extData = await fetchDisasterData(lat, lon);
      const reasoning = await axios.post(process.env.REASONING_API, { text, data: extData });
      reportData.reasoning_verdict = reasoning.data.verdict;
    }

    await Report.create(reportData);

    return res.status(201).json({
      message: "Report submitted successfully",
      data: reportData,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = validateReport;
