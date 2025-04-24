const express = require("express");
const userController = require("../controllers/userController");
const userAuthentication = require("../middlewares/userAuthentication");
const  upload  = require("../middlewares/cloudinary");
const userRoutes = express.Router();


userRoutes.post("/register", userController.register);
userRoutes.post("/login", userController.login);
userRoutes.put("/edit", userAuthentication,upload.single("image"),userController.profile);
userRoutes.put("/addemergency", userAuthentication,userController.emergencyContacts);
userRoutes.delete("/logout", userController.logout);
userRoutes.post("/location", userAuthentication,userController.updateLocation);
userRoutes.get("/view", userAuthentication,userController.getUserProfile);
userRoutes.get("/find/:phone", userAuthentication,userController.getLocation);
userRoutes.get("/emergency", userAuthentication,userController.view_emergency);
userRoutes.post("/forgot", userController.forgotPassword);
userRoutes.post("/reset", userController.resetPassword);
userRoutes.put("/editemergency", userAuthentication,userController.editEmergencyContact);
userRoutes.delete("/deleteemergency/:id", userAuthentication,userController.deleteEmergencyContact);
userRoutes.put("/changepswd", userAuthentication,userController.changePassword);


module.exports = userRoutes;
