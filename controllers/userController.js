const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const asyncHandler=require("express-async-handler")
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { log } = require("console");

const userController={
    forgotPassword: asyncHandler(async (req, res) => {
        const { email } = req.body;
        const user = await User.findOne({ email });
        console.log(email); 
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        // Generate Reset Token
        const resetToken = crypto.randomBytes(32).toString("hex");
        const hashedToken = await bcrypt.hash(resetToken, 10);
        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour expiry
        await user.save();
       // Send Email
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
  });

const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}&email=${email}`;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Password Reset Request",
            text: `Click on this link to reset your password: ${resetLink}`,
        };
transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: "Email could not be sent" });
            }
            res.json({ message: "Reset link sent to your email" });
        });
    }),

    
    resetPassword: asyncHandler(async (req, res) => {
        const { email, token, newPassword } = req.body;
        const user = await User.findOne({ email });
        console.log(email, token, newPassword);
        if (!user || !user.resetPasswordToken) {
            return res.status(400).json({ message: "Invalid or expired token" });
        }
        const isTokenValid = await bcrypt.compare(token, user.resetPasswordToken);
        if (!isTokenValid || user.resetPasswordExpires < Date.now()) {
            return res.status(400).json({ message: "Invalid or expired token" });
        }
        user.password = await bcrypt.hash(newPassword, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();
        res.json({ message: "Password reset successful" });
    }),

    register : asyncHandler(async(req,res)=>{       
        const { username, email, district, location, password, emergencyContacts, phone } = req.body;
        console.log(req.body);
        
        const userExits=await User.findOne({username})
        if(userExits){
            throw new Error("User already exists")
        }
        const hashed_password=await bcrypt.hash(password,10)
        const userCreated=await User.create({
            username,
            email,
            phone,
            district,
            location,
            password:hashed_password,
            emergencyContacts
        })
        if(!userCreated){
            throw new Error("User creation failed")
        }
        const payload={
            name:userCreated.username,  
            email:userCreated.email,
            role:userCreated.role,
            id:userCreated.id
        }
        const token=jwt.sign(payload,process.env.JWT_SECRET_KEY)
        res.json(token)
}),

    googleRegister : asyncHandler(async(req,res)=>{        
        const email=req.user.emails[0].value
        const userExits=await User.findOne({email})
        if(!userExits){
            
        const userCreated=await User.create({        
            email,
            username:email
        })
        if(!userCreated){
            throw new Error("User creation failed")
        }
        const payload={
            email:userCreated.email,
            id:userCreated.id
        }
        const token=jwt.sign(payload,process.env.JWT_SECRET_KEY)
        res.cookie("token",token,{
            maxAge:2*24*60*60*1000,
            http:true,
            sameSite:"none",
            secure:false
        })
    }
        res.send("User created successfully")
    }),
    
    login :asyncHandler(async(req,res)=>{
        const {email,password}=req.body
        const userExist=await User.findOne({email})
        if(!userExist){
            throw new Error("User not found")
        }
        const passwordMatch=await bcrypt.compare(password,userExist.password)
        if(!passwordMatch){
            throw new Error("Passwords not matching")
        }
        const payload={
            name:userExist.username,  
            email:userExist.email,
            role:userExist.role,
            id:userExist.id
        }
        const token=jwt.sign(payload,process.env.JWT_SECRET_KEY)
        res.json(token)
    }),  

    getUserProfile : asyncHandler(async (req, res) => {
            const userId = req.user.id;         
            const user = await User.findById(userId).select("-password"); 
            if (!user) {
                throw new Error("User not found");
            }        
            res.send({
                message: "User details retrieved successfully",
                user
            });
        }),

    logout:asyncHandler(async(req,res)=>{
        res.clearCookie("token")
        res.send("User logged out")
        }),

    profile:asyncHandler(async (req, res) => {
        const { username, password, phone,address } = req.body;
        const userId = req.user.id; 
        const user = await User.findOne({_id:userId});
        if (!user) {
            throw new Error("User not found");
        }       
        let hashed_password = user.password; 
        if (password) {
            hashed_password = await bcrypt.hash(password, 10);
        }            
        user.username = username || user.username;
        user.password = hashed_password;
        user.phone = phone || user.phone;            
        user.address = address || user.address; 
        const updatedUser = await user.save();            
        if(!updatedUser){
            res.send('Error in updating')
        }
        res.send(user);
     }),
     profile: asyncHandler(async (req, res) => {
        const { username, password, phone, address } = req.body;
        const userId = req.user.id;
      
        const user = await User.findOne({ _id: userId });
        if (!user) {
          throw new Error("User not found");
        }
      
        let hashed_password = user.password;
        if (password) {
          hashed_password = await bcrypt.hash(password, 10);
        }
      
        user.username = username || user.username;
        user.password = hashed_password;
        user.phone = phone || user.phone;
        user.address = address || user.address;
      
        // Handle uploaded image (if any)
        if (req.file && req.file.path) {
          user.image = req.file.path;
        }
      
        const updatedUser = await user.save();
        if (!updatedUser) {
          return res.status(500).send("Error in updating");
        }
      
        res.send(user);
      }),
      
     emergencyContacts:asyncHandler(async (req, res) => {
        const { emergencyContacts } = req.body;
        const userId = req.user.id; 
        const user = await User.findOne({_id:userId});
        if (!user) {
            throw new Error("User not found");
        }       
        user.emergencyContacts.push(...emergencyContacts);
      
        const updatedUser = await user.save();            
        if(!updatedUser){
            res.send('Error in updating')
        }
        res.send(emergencyContacts);
     }),

     view_emergency: asyncHandler(async (req, res) => {
        const userId = req.user.id; 
        const user = await User.findById(userId).select("emergencyContacts");
    
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }       
        res.json(user.emergencyContacts);
    }), 

editEmergencyContact:asyncHandler(async (req, res) => {
        const { id, contact } = req.body;
        const userId = req.user.id;
        console.log(id,contact);
        
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
    
        if (id < 0 || id >= user.emergencyContacts.length) {
            return res.status(400).json({ message: "Invalid index" });
        }
    
        user.emergencyContacts[id] = contact;
        await user.save();
    
        res.status(200).json({ message: "Emergency contact updated", emergencyContacts: user.emergencyContacts });
    }),

deleteEmergencyContact:asyncHandler(async (req, res) => {
        const { id } = req.params;
        const userId = req.user.id;
        const delId=id-1
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
    
        if (delId < 0 || delId >= user.emergencyContacts.length) {
            return res.status(400).json({ message: "Invalid index" });
        }
    
        user.emergencyContacts.splice(delId, 1);
        await user.save();
    
        res.status(200).json({ message: "Emergency contact deleted", emergencyContacts: user.emergencyContacts });
    }),   

updateLocation:asyncHandler(async (req, res) => {
        const { latitude, longitude } = req.body;
        const user = await User.findOne({_id:req.user.id});
        if (!user) {
            res.send('User not found');
        }
        user.location = {
            latitude: latitude,
            longitude: longitude
        };
        user.time = new Date();
        await user.save();
        res.send({
            message: 'Location updated successfully',
            location: user.location,
        });
    }),
    getLocation:asyncHandler(async (req, res) => {
        const {phone } = req.params; 
        const user = await User.findOne({_id:req.user.id});
        console.log(user);
        const requestingUser = await User.findOne({phone});

        if (!requestingUser) {
            throw new Error("Requesting user not found");
        }
        console.log(requestingUser);
        // Check if requesting user is in the emergencyContacts list of the target user
        if (!requestingUser.emergencyContacts.includes(user.phone)) {
            throw new Error("You are not authorized to view this user's location" );
        }
        // Return the location of the user
        res.json({
            location: requestingUser.location,
            time: requestingUser.time
        });
        
    }),
    changePassword: asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const { oldPassword, newPassword } = req.body;
    
        // Validate input
        if (!oldPassword || !newPassword) {
            res.status(400);
            throw new Error("Both old and new passwords are required");
        }
    
        const user = await User.findById(userId);
        if (!user) {
            res.status(404);
            throw new Error("User not found");
        }
    
        // Check if old password matches
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            res.status(401);
            throw new Error("Incorrect old password");
        }
    
        // Hash the new password
        // const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, 10);
    
        // Save the updated user
        await user.save();
    
        res.send({
            message: "Password changed successfully",
        });
    })
}
module.exports=userController