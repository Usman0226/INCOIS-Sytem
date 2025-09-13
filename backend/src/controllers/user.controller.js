const Report = require("../models/report");

const validateReport = async (req, res) => {
  const { text, image_url, video_url, lat, lon } = req.body;

  const reportData = {
    text: text,
    image_url: image_url,
    video_url: video_url,
    lat: lat,
    lon: lon,
  };

  if (!text && !image_url) {
    return res.status(400).json({ message: "Image and text are necessary !  " });
  }

  if (!video_url || !lat || !lon) {
    return res
      .status(400)
      .json({ message: "Insufficeint data to submit report !" });
  }

//   const dups = Report.find({
//     lat,
//     lon,
//   });


  await Report.create(reportData);

  console.log("Report saved ! ");
  console.log(reportData);

  res
    .status(201)
    .json({ message: "Report sumitted successfully", data: reportData });
};

module.exports = validateReport;
