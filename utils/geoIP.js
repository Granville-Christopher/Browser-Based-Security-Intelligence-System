const getGeoLocation = async (ip) => {
  try {
    // Handle local or undefined IP
    if (!ip || ip === "::1" || ip === "127.0.0.1") {
      return {
        city: "Local Network",
        region: "Local",
        country: "Reserved",
        countryCode: null,
        isp: "Private",
        ispLogo: null,
        latitude: null,
        longitude: null,
        mapLink: null,
      };
    }

    // Include countryCode in fields
    const response = await fetch(
      `http://ip-api.com/json/${ip}?fields=status,message,country,countryCode,regionName,city,isp,lat,lon`
    );

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const data = await response.json();

    if (data.status !== "success") {
      if (data.message === "reserved range") {
        console.warn("🌐 IP is in reserved range:", ip);
      } else {
        console.warn("Geo IP fetch failed:", data.message);
      }

      return {
        city: "Local Network",
        region: "Local",
        country: "Reserved",
        countryCode: null,
        isp: "Private",
        ispLogo: null,
        latitude: null,
        longitude: null,
        mapLink: null,
      };
    }

    const lat = data.lat || null;
    const lon = data.lon || null;

    return {
      city: data.city || "Unknown",
      region: data.regionName || "Unknown",
      country: data.country || "Unknown",
      countryCode: data.countryCode || null,
      isp: data.isp || "Unknown",
      ispLogo: null, // Optionally assign logos based on ISP
      latitude: lat,
      longitude: lon,
      mapLink:
        lat && lon ? `https://www.google.com/maps?q=${lat},${lon}` : null,
    };
  } catch (err) {
    console.error("Geo IP fetch error:", err.message || err);
    return {
      city: "Unknown",
      region: "Unknown",
      country: "Unknown",
      countryCode: null,
      isp: "Unknown",
      ispLogo: null,
      latitude: null,
      longitude: null,
      mapLink: null,
    };
  }
};

module.exports = getGeoLocation;
