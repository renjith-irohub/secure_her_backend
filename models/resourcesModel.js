const mongoose = require('mongoose');

const educationalResourceSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
},
  resourceType: { 
    type: String, 
    enum: ["video", "image"], 
    required: true 
},
  content: { 
    type: String, 
    required: true 
},
  description: { 
    type: String, 
    required: true 
}
});

const EducationalResource = mongoose.model("EducationalResource", educationalResourceSchema);
module.exports = EducationalResource;
