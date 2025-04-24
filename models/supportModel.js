const mongoose = require("mongoose");

const supportRequestSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
},
supporter:{
  type: mongoose.Schema.Types.ObjectId, 
    ref: "User"
},
  requestDetails: { 
    type: String, 
    required: true },
  status: { 
    type: String, 
    enum: ["active", "completed","onprogress"], 
    default: "active" 
},
location:{
    latitude: { type: Number  },
      longitude: { type: Number }
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
},
  nearbyUsers: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User" 
  }]
}, { timestamps: true });


const SupportRequest = mongoose.model("SupportRequest", supportRequestSchema);
module.exports = SupportRequest;
