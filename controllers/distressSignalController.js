const asyncHandler=require("express-async-handler");
const User = require("../models/userModel");
const DistressSignal = require("../models/distressSignalModel");
const Notification = require("../models/notificationModel");
const axios=require("axios")

function calculateDistance(lat1, lng1, lat2, lng2) {
    const toRad = (value) => (value * Math.PI) / 180;

    const R = 6371; // Earth's radius in kilometers
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance.toFixed(2); // Return distance rounded to 2 decimal places
}

const distressSignalController={
    nearestPolice:asyncHandler(async (req, res) => {
        const user=await User.findById(req.user.id)
        const lat=user.location.latitude
        const lng=user.location.longitude
        try {
            const apiKey = process.env.GOOGLE_MAPS_API_KEY;
            const radius = 5000; // Search within 5km radius (adjust as needed)
            const type = 'police'; // Google Places API type for police stations

            // Construct the Google Places API URL
            const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=${type}&key=${apiKey}`;
            console.log(url);
            const response = await axios.get(url);
            console.log(response);

            try {
                // Make the API request
                const response = await axios.get(url);
                console.log(response);
                
                const results = response.data.results;

                if (results.length === 0) {
                    return { message: 'No police stations found nearby' };
                }

                // Find the nearest police station
                const nearestStation = results.map((station) => {
                    const stationLat = station.geometry.location.lat;
                    const stationLng = station.geometry.location.lng;

                    // Calculate distance using Haversine formula
                    const distance = calculateDistance(lat, lng, stationLat, stationLng);

                    return {
                        name: station.name,
                        address: station.vicinity,
                        location: {
                            lat: stationLat,
                            lng: stationLng,
                        },
                        distance: distance, // Distance in kilometers
                    };
                }).sort((a, b) => a.distance - b.distance)[0]; // Sort by distance and get the closest
console.log(nearestStation);

                res.json(nearestStation) ;
            } catch (error) {
                throw new Error('Failed to fetch police stations from Google Maps API');
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error fetching police stations' });
        }
    }),
    sendDistressSignal: asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const client = req.client;
        const user = await User.findById(userId);
        
        if (!user) throw new Error("User not found");
        if (!user.emergencyContacts) throw new Error("No emergency contact found");
    
        const location = user.location;
        const distressSignal = new DistressSignal({ userId, location });
        const complete = await distressSignal.save();
    
        if (!complete) {
            throw new Error("Error in creating signal");
        }
    
        const phone = "+91" + user.emergencyContacts;
        const destination = `${location.latitude},${location.longitude}`;
        const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving`;
        const messageBody = `Emergency Alert! ${user.username} is in distress at location: ${googleMapsUrl}. Please check immediately.`;
        
        // Send SMS notification
        await client.messages.create({
            body: messageBody,
            from: req.number,
            to: phone,
        });
        
        // Save notification in the database
        const notification = new Notification({
            user: userId,
            message: "🚨A distress signal has been sent.",
        });
        await notification.save();
        
        res.send({ message: "Distress signal sent, SMS delivered, and notification saved", distressSignal });
    }),

    getDistressSignalsByUser :asyncHandler( async (req, res) => {
        const  userId = req.user.id;
        const signals = await DistressSignal.find({ userId });
        if(!signals){
            throw new Error("No signals found!")
        }
        res.send(signals);
    }),

    getDistressSignalsForAdmin :asyncHandler( async (req, res) => {
        const signals = await DistressSignal.find().populate('userId');
        if(!signals){
            throw new Error("No signals found!")
        }
        res.send(signals);
    }),

    resolveDistressSignal: asyncHandler(async (req, res) => {
            const { id } = req.body;
            const updatedSignal = await DistressSignal.findByIdAndUpdate(id, { status: 'resolved' }, { new: true });
            if (!updatedSignal) throw new Error('Distress signal not found' );
            res.send({ message: 'Distress signal resolved', updatedSignal });
            
        
    }),
deleteSignalById :asyncHandler(async (req, res) => {
        const { id } = req.params;
      
        const deleted = await DistressSignal.findOneAndDelete({
          _id: id,
          userId: req.user.id,
        });
      
        if (!deleted) {
          return res.status(404).json({ message: "Signal not found" });
        }
      
        res.status(200).json({ message: "Signal deleted successfully", id });

      }),

}
module.exports=distressSignalController