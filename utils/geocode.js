import fetch from "node-fetch";

const geocodeLocation = async (address) => {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;

  const response = await fetch(url, {
    headers: {
      "User-Agent": "wanderlust-project"
    }
  });

  const data = await response.json();

  if (!data.length) return null;

  return {
    lat: data[0].lat,
    lng: data[0].lon
  };
};

export default geocodeLocation;
