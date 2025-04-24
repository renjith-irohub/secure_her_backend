const asyncHandler=require("express-async-handler");
const User = require("../models/userModel");
const Report = require("../models/reportingModel");
const DistressSignal = require("../models/distressSignalModel");

const routeController={
   getRouteWithMostUsersNearby: asyncHandler(async (req, res) => {
    const { startLatitude, startLongitude, endLatitude, endLongitude } = req.query;


    // Format coordinates for Google Maps
    const origin = `${startLatitude},${startLongitude}`;
    const destination = `${endLatitude},${endLongitude}`;

    // Get all user locations from DB
    const users = await User.find();
    const userLocations = users.map(user => ({
        latitude: user.latitude,
        longitude: user.longitude,
    }));

    // Google Maps Directions URL
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;

    res.json({ googleMapsUrl, userLocations });
}),

    
getAllReportsLocations: asyncHandler(async (req, res) => {
        const reports = await Report.find().select("-__v").populate("userId"); 
        if(!reports)
        {
          res.send('No reports found')
        }
        res.send(reports);
    }),
}
module.exports=routeController