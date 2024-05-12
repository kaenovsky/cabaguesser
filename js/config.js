const config = {
    googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY
};

function getGoogleMapsApiKey() {
    return config.googleMapsApiKey;
}