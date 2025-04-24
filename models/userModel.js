const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true 
},
  email: { 
    type: String, 
    required: true, 
    unique: true 
},
phone:{
  type:Number,
  // unique:true
},
time:{
  type:Date
},
address:{
  type:String,
},
location:{
  latitude: { type: Number  },
    longitude: { type: Number }
},
  password: { 
    type: String
},
resetPasswordToken:{
  type: String
},
verified:{
  type:Boolean,
  default:false
},
  emergencyContacts: {
    type: [String], // Ensure it is an array of strings
    default: [] // Set default value as an empty array
}, // Can store user IDs or phone numbers
image:{
  type:String
}
});

const User = mongoose.model("User", UserSchema);
module.exports = User;
