const asyncHandler=require("express-async-handler");
const User = require("../models/userModel");
const Report = require("../models/reportingModel");
const Notification = require("../models/notificationModel");

const reportingController={
    createReport :asyncHandler(async (req, res) => {
      const { incidentDetails, reportType, anonymous, place, latitude, longitude } = req.body;    
      const user = await User.findOne({ _id: req.user.id });
      
      if (!user.verified) {
        throw new Error("Please verify before logging in");
    }
      const reportData = {
        incidentDetails,
        location: { latitude, longitude }, // Ensure location is saved correctly
        reportType,
        anonymous,
        place,
        userId:req.user.id  
      };
       
        const newReport = new Report(reportData);
        const complete=await newReport.save();   
        if(!complete){
          throw new Error("Failed to report")
        } 
         
          // Save notification in the database
          const notification = new Notification({
              user: user,
              message: "📝A report has been filed.",
          });
          await notification.save();
        res.send({ message: "Report submitted successfully", report: newReport });
    }),
    
  getReports :asyncHandler(async (req, res) => {
        const reports = await Report.find().select("-__v").populate("userId"); 
        if(!reports)
        {
          res.send('No reports found')
        }
        res.send(reports);
    }),
    
  getReportByUser :asyncHandler(async (req, res) => {
        const report = await Report.find({userId:req.user.id});
        if (!report) {
          res.send("No report found" );
        }
        res.status(200).json(report);
    }),

  getReportById :asyncHandler(async (req, res) => {
    const {incidentDetails,reportType}=req.body
        const searchCriteria = {};
        if(incidentDetails){
        searchCriteria.incidentDetails = { $regex: incidentDetails, $options: "i" };}
        if(reportType){
          searchCriteria.reportType = { $regex: reportType, $options: "i" };}
        const report = await Report.find(searchCriteria);
        if (!report) {
          throw new Error("Report not found");
        }
        res.send(report);
    }),
    
  deleteReport:asyncHandler( async (req, res) => {
    const {id}=req.body
        const report = await Report.deleteOne({_id:id,userId:req.user.id});    
        if (!report) {
          throw new Error("Report not found or Delete function failed");
        }  
        res.send("Report deleted successfully");
    }),    
}
module.exports=reportingController