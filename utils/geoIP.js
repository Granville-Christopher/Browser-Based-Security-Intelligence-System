const getGeoLocation = async (ip) => {
  try {
    const response = await fetch(
      `http://ip-api.com/json/${ip}?fields=status,message,country,regionName,city,isp`
    );
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
        isp: "Private",
      };
    }

    return {
      city: data.city || "Unknown",
      region: data.regionName || "Unknown",
      country: data.country || "Unknown",
      isp: data.isp || "Unknown",
    };
  } catch (err) {
    console.error("Geo IP fetch error:", err);
    return {
      city: "Unknown",
      region: "Unknown",
      country: "Unknown",
      isp: "Unknown",
    };
  }
};

module.exports = getGeoLocation;
