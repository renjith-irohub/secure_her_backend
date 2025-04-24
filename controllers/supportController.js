const asyncHandler=require("express-async-handler");
const User = require("../models/userModel");
const SupportRequest = require("../models/supportModel");
const Notification = require("../models/notificationModel");
const DistressSignal = require("../models/distressSignalModel");

function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
}

const supportController={
    createSupportRequest:asyncHandler(async (req, res) => {
        const {requestDetails,latitude,longitude,name}=req.body
        const currentUser = await User.findOne({_id:req.user.id});

        const allUsers = await User.find({ _id: { $ne: currentUser.id } });

        const nearbyUsers = allUsers.filter(user => {
            if (user.location && user.location.latitude && user.location.longitude) 
                if (user.username !== "Admin" && user.location && user.location.latitude && user.location.longitude) {
                const distance = getDistance(
                    currentUser.location.latitude,
                    currentUser.location.longitude,
                    user.location.latitude,
                    user.location.longitude
                );
                return distance <= 5;
            }
            return false;
        });
        if (nearbyUsers.length === 0) {
            res.send("No nearby users found.");
        }
        const destination = `${currentUser.location.latitude},${currentUser.location.longitude}`;
        const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving`;
        const messageBody =  `Support Request!\n${currentUser.username} needs help.\n Location: ${googleMapsUrl}\n ${requestDetails}`;
       
        
        const client=req.client
        for (const user of nearbyUsers) {
            if (user.phone) {
                const num = "+91" + user.phone;
                try {
                    const done=await client.messages.create({
                        body: messageBody,
                        from: req.number,
                        to: num,
                    });
                    console.log("Message sent to:", done);
                } catch (err) {
                    console.error("Error sending SMS to", user.phone, err.message);
                }
            }
        }
        
        const supportRequest = await SupportRequest.create({
            userId: currentUser._id,
            requestDetails,
            location: {
                latitude: latitude,
                longitude: longitude
            }, 
            nearbyUsers: nearbyUsers.map(user => user._id) // Save nearby users
        });
        console.log(latitude,longitude);
        
        if(!supportRequest){
            throw new Error("Failed to save the request!")
        }
        
            res.send("Request send")
      }),

      getNearbySupportRequests :asyncHandler(async (req, res) => {
        const userId = req.user.id;
        
        const supportRequests = await SupportRequest.find({
            nearbyUsers: userId
        }).populate("userId", "username email") // Optionally populate the userId to get user details
          .populate("nearbyUsers", "username email"); // Optionally populate the nearbyUsers to get user details
    
        // if (supportRequests.length === 0) {
        //     res.send("No support requests received.");
        // }
    
        res.send(supportRequests );
      }),

      getYourSupportRequests :asyncHandler(async (req, res) => {
        const userId = req.user.id;
        
        const supportRequests = await SupportRequest.find({
            userId: userId
        }).populate("userId", "username email") // Optionally populate the userId to get user details
          .populate("nearbyUsers", "username email"); // Optionally populate the nearbyUsers to get user details
    
        
    
        res.send(supportRequests );
      }),
      
    completeSupportRequest :asyncHandler(async (req, res) => {
          const { id } = req.params; 
          const request = await SupportRequest.findById(id);
          if (!request) {
            throw new Error("Request not found");
          }      
          request.status = "completed";
          await request.save();      
          res.send("Request marked as completed");
      }),

      offerSupportRequest :asyncHandler(async (req, res) => {
       
        const { id} = req.params;   
        const user=req.user.id
        const request = await SupportRequest.findById(id);
        if (!request) {
          throw new Error("Request not found");
        }      
        request.status = "onprogress";
        request.supporter = user
        await request.save();      
        res.send("Request marked as completed");
    }),
    
}
module.exports=supportController