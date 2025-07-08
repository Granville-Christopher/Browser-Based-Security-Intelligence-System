const axios = require("axios");

const reverseGeocode = async (lat, lon) => {
  const apiKey = process.env.OPENCAGE_API_KEY;
  try {
    const response = await axios.get(
      `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lon}&key=${apiKey}`
    );

    if (response.data && response.data.results.length > 0) {
      return response.data.results[0].formatted;
    } else {
      return "Unknown location";
    }
  } catch (err) {
    console.error("OpenCage reverse geocode error:", err.message);
    return "Unknown location";
  }
};

module.exports = reverseGeocode;