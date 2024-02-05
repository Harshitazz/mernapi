const API_KEY = "5114baf50f1c468f916ceccac6da825f";

const axios = require('axios');

const HttpError = require('../models/http-error');

async function getCoordsForAddress(address) {
  try {
    const response = await axios.get(
      `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(address)}&apiKey=${API_KEY}`
    );
    const data = response.data;

    // Check if the expected data structure is present
    if (!data ) {
      throw new HttpError('Could not find location for the specified address.', 422);
    }

    const coordinates = data.features[0].geometry.coordinates;

    return coordinates;
  } catch (error) {
    // Handle axios or other errors
    throw new HttpError('Error fetching coordinates from the Geocoding API.', 500);
  }
}

module.exports = getCoordsForAddress;



/*const API_KEY= "5114baf50f1c468f916ceccac6da825f";

const axios = require('axios');

const HttpError = require('../models/http-error');


async function getCoordsForAddress(address) {
  // return {
  //   lat: 40.7484474,
  //   lng: -73.9871516
  // };
  const response = await axios.get(
    `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(address)}&apiKey=${API_KEY}`
  );

  const data = response.data;

  if (!data ) {
    const error = new HttpError(
      'Could not find location for the specified address.',
      422
    );
    throw error;
  }

  const coordinates = data.results[0].geometry.coordinates;

  return coordinates;
}

module.exports = getCoordsForAddress;*/


