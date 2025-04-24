const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const DistressSignal = require("../models/distressSignalModel");
const Report = require("../models/reportingModel");
const SupportRequest = require("../models/supportModel");
const Notification = require("../models/notificationModel");

const adminController={
    getDashboardData: asyncHandler(async (req, res) => {
        const userCount = await User.countDocuments({ username: { $ne: "Admin" } });
        const signalCount = await DistressSignal.countDocuments();
        const reportCount = await Report.countDocuments();
        const supportCount = await SupportRequest.countDocuments();
      
        const stats = [
          { title: "Total Users", count: userCount },
          { title: "Distress Alerts", count: signalCount },
          { title: "Anonymous Reports", count: reportCount },
          { title: "Support Requests", count: supportCount },
        ];
      
        const barChart = [
          { name: "Users", value: userCount },
          { name: "Alerts", value: signalCount },
          { name: "Reports", value: reportCount },
          { name: "Support", value: supportCount },
        ];
      
        const pieChart = barChart; // Use the same for pie unless separate logic
      
        res.json({ stats, barChart, pieChart });
      }),
      

     getUserData :asyncHandler(async (req, res) => {
        const userCount = await User.find({ username: { $ne: "Admin" } });
          const signalCount = await DistressSignal.find();
          const reportCount = await Report.find();
          const supportCount = await SupportRequest.find();
          const dashboard = {
            userCount,
            signalCount,
            reportCount,
            supportCount,
          };
      
          res.send(dashboard);
        
      }),
      
    verifyUser:asyncHandler(async (req, res) => {
        const { id,status } = req.body;        
         const user = await User.findById(id);     
         if (!user) {
             return res.status(404).json({ message: "User not found" });
        }
        if (status === "approved") {
            user.verified = true;
        } else if (status === "rejected") {
            user.verified = false;
            await User.findByIdAndDelete(id)
        }    
        await user.save();
        const notification = new Notification({
                    user,
                    message: "✅You are verified successfully.",
                });
                await notification.save();
        res.json({ message: "User verification updated"});
    }),
    viewallSupport:asyncHandler(async (req, res) => {
        const requests = await SupportRequest.find().populate("userId","username").populate("supporter","username");    
        res.send(requests);      
    }),
    getReports :asyncHandler(async (req, res) => {
            const reports = await Report.find().select("-__v").populate("userId"); 
            if(!reports)
            {
              res.send('No reports found')
            }
            res.send(reports);
        }),
        
}
module.exports=adminController