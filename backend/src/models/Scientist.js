const mongoose = require('mongoose');

const ScientistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true, 
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match : [/^[\w.-]+@gov\.in$/, "Email must end with @gov.in"]
  },
  password : String,
  organization : {
    type : String,
    enum : ['INCOIS','NDMA']
  }

});

module.exports = mongoose.model("Scientist", ScientistSchema);
