const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());

const API_KEY = "AIzaSyAnv8WowEjltmRA3-k6MzJShbSI2v3keLc";

app.get("/api/nearby-police", async (req, res) => {
    const { lat, lng } = req.query;
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=1000&type=police&key=${API_KEY}`;

    try {
        const response = await axios.get(url);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch data" });
    }
});

app.listen(5000, () => console.log("Server running on port 5000"));
