const axios = require("axios");

module.exports.geocodeLocation = async (location) => {
  const response = await axios.get(
    "https://photon.komoot.io/api/",
    {
      params: {
        q: location,
        limit: 1
      },
      timeout: 10000
    }
  );

  if (!response.data.features.length) {
    throw new Error("Location not found");
  }

  const coords = response.data.features[0].geometry.coordinates;

  return {
    lng: coords[0],
    lat: coords[1]
  };
};
