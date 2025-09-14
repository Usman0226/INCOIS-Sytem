const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  image_url: {
    type: [String],
    default: []
  },
  video_url: {
    type: [String],
    default: []
  },
  lat : String,
  lon : String,
  // metadata: {
  //   user_id: { type: String, required: true },
  //   lat: { type: Number, required: true },
  //   lon: { type: Number, required: true },
  //   device: { type: String, required: true },
  //   timestamp: { type: Date, required: true }
  // }
},{timestamps : true});

const Report = mongoose.model('Report', reportSchema);

module.exports = Report;
