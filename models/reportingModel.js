const mongoose = require("mongoose");

const ReportSchema = new mongoose.Schema({
  incidentDetails: {
    type: String,
    required: true,
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User"
  },
  place:{
    type: String,
  },
  location: {
    latitude: { type: Number,  },
    longitude: { type: Number, }
  },
  reportType: {
    type: String,
    required: true,
  },
  anonymous: {
    type: Boolean,
    default: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  
});


const Report = mongoose.model("Report", ReportSchema);
module.exports = Report;
