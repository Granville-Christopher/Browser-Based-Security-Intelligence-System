const getGeoLocation = async (ip) => {
  try {
    // Fallback if somehow IP is undefined/null
    if (!ip || ip === "::1" || ip === "127.0.0.1") {
      return {
        city: "Local Network",
        region: "Local",
        country: "Reserved",
        isp: "Private",
      };
    }

    const response = await fetch(
      `http://ip-api.com/json/${ip}?fields=status,message,country,regionName,city,isp`
    );

    // Handle HTTP errors
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const data = await response.json();

    // Handle API-level errors
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
    console.error("Geo IP fetch error:", err.message || err);
    return {
      city: "Unknown",
      region: "Unknown",
      country: "Unknown",
      isp: "Unknown",
    };
  }
};

module.exports = getGeoLocation;
