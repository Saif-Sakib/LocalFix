const express = require("express");
const router = express.Router();

// Get Mapbox token for frontend
router.get("/mapbox-token", (req, res) => {
    try {
        const mapboxToken = process.env.MAPBOX_TOKEN;
        if (!mapboxToken) {
            return res.status(500).json({ 
                message: "Mapbox token not configured" 
            });
        }
        res.json({ token: mapboxToken });
    } catch (error) {
        console.error("Error fetching mapbox token:", error);
        res.status(500).json({ 
            message: "Error fetching mapbox token" 
        });
    }
});

module.exports = router;
