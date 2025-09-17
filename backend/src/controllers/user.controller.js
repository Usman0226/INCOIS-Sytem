const Report = require("../models/report");

const validateReport = async (req, res) => {
  try {
    const { hazardType , text, lat, lon } = req.body;
    const files = req.files;

    const parsedLat = parseFloat(lat);
    const parsedLon = parseFloat(lon);

    let image_urls = [];
    let video_urls = [];

    if (files) {
      if (files.image) {
        image_urls = files.image.map((file) => file.filename);
      }
      if (files.video) {
        video_urls = files.video.map((file) => file.filename);
      }
    }

    if (!text && image_urls.length === 0 && video_urls.length === 0) {
      return res
        .status(400)
        .json({ message: "Either text or media files are required." });
    }

    if (!lat || !lon || Number.isNaN(parsedLat) || Number.isNaN(parsedLon)) {
      return res
        .status(400)
        .json({ message: "Location coordinates are required!" });
    }

    const DUP_RADIUS = 0.001;
    const existingCluster = await Report.findOne({
      lat: {
        $gte: parsedLat - DUP_RADIUS,
        $lte: parsedLat + DUP_RADIUS,
      },
      lon: {
        $gte: parsedLon - DUP_RADIUS,
        $lte: parsedLon + DUP_RADIUS,
      },
    });

    let savedReport;
    if (existingCluster) {
      if (text) {
        existingCluster.text = existingCluster.text
          ? `${existingCluster.text} | ${text}`
          : text;
      }
      if (image_urls.length > 0) {
        existingCluster.image_url.push(...image_urls);
      }
      if (video_urls.length > 0) {
        existingCluster.video_url.push(...video_urls);
      }

      savedReport = await existingCluster.save();
      console.log(" Push to already existing cluster:", savedReport._id);
    } else {
      const reportData = {
        hazardType,
        text,
        image_url: image_urls,
        video_url: video_urls,
        lat: parsedLat,
        lon: parsedLon,
      };

      savedReport = await Report.create(reportData);
      console.log(" New report cluster created:", savedReport._id);
    }

    return res.status(201).json({
      message: "Report submitted successfully",
      data: savedReport,
    });
  } catch (error) {
    console.error("Error validating report:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = validateReport;

// const Report = require("../models/report");
// const axios = require("axios");

// const validateReport = async (req, res) => {
//   try {
//     const { text, image_url, video_url, lat, lon } = req.body;

//     if (!text && !image_url) {
//       return res.status(400).json({ message: "Image or text is required!" });
//     }
//     if (!lat || !lon) {
//       return res.status(400).json({ message: "Coordinates are required!" });
//     }

//     let reportData = { text, image_url, video_url, lat, lon };

//     //  Cross-Modal Consistency
//     if (text && image_url) {
//       const consistency = await axios.post(process.env.CONSISTENCY_API_URL, { text, image_url });
//       reportData.consistency_score = consistency.data.score;
//     }

//     // Satellite Imagery Verification
//     if (isHighPriority(reportData)) {
//       const satCheck = await checkSatelliteChange(lat, lon);
//       reportData.satellite_change = satCheck;
//     }

//     if (text) {
//       const styleCheck = await axios.post(process.env.STYLOMETRY_API_URL, { text });
//       reportData.stylometry_flag = styleCheck.data.is_fake;
//     }

//     if (containsDisasterClaim(text)) {
//       const extData = await fetchDisasterData(lat, lon);
//       const reasoning = await axios.post(process.env.REASONING_API, { text, data: extData });
//       reportData.reasoning_verdict = reasoning.data.verdict;
//     }

//     await Report.create(reportData);

//     return res.status(201).json({
//       message: "Report submitted successfully",
//       data: reportData,
//     });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

// module.exports = validateReport;
