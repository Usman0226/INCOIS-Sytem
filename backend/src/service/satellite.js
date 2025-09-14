
import axios from "axios";

/**
 * Checks if significant changes are detected in satellite imagery
 * around a given location (lat, lon). This function is designed to
 * gracefully fail by returning null if any API calls or checks time out
 * or result in an error.
 *
 * @param {number} lat - The latitude of the location to check.
 * @param {number} lon - The longitude of the location to check.
 * @param {object} [options] - Optional parameters to customize the request.
 * @param {number} [options.radius=1000] - The radius in meters around the central point.
 * @param {string} [options.before="-7d"] - The timeframe for the 'before' image (e.g., "-7d" for 7 days ago).
 * @returns {Promise<boolean | null>} A promise that resolves to:
 * - `true` if a significant change is detected.
 * - `false` if no significant change is detected.
 * - `null` if an error occurs, imagery is unavailable, or the request times out.
 */
export async function checkSatelliteChange(lat, lon, options = {}) {
  // Set default values for options and define a timeout for API calls
  const { radius = 1000, before = "-7d" } = options;
  const API_TIMEOUT = 15000; // 15-second timeout for each request

  try {
    // 1. Request 'before' and 'after' satellite images from the provider's API.
    const satelliteResponse = await axios.get(process.env.SATELLITE_API_URL, {
      params: { lat, lon, radius, before, after: "now" },
      headers: { "Authorization": `Bearer ${process.env.SATELLITE_API_KEY}` },
      timeout: API_TIMEOUT,
    });

    const { before_image_url, after_image_url } = satelliteResponse.data;

    // If either image URL is missing, we cannot perform a comparison.
    if (!before_image_url || !after_image_url) {
      console.warn(`Satellite images unavailable for coordinates: ${lat}, ${lon}`);
      return null;
    }

    // 2. Send the two image URLs to the internal ML change-detection service.
    const changeDetectionResponse = await axios.post(
      process.env.CHANGE_DETECTION_API_URL,
      {
        before: before_image_url,
        after: after_image_url,
      },
      { timeout: API_TIMEOUT } // Apply timeout to this request as well
    );

    // 3. Return the boolean result from the ML service.
    // The '|| false' ensures a boolean is returned even if the property is missing.
    return changeDetectionResponse.data.change_detected || false;

  } catch (error) {
    // Gracefully handle different types of errors without crashing the application.
    if (axios.isCancel(error)) {
      console.error(`Satellite check request timed out: ${error.message}`);
    } else {
      console.error(`An error occurred during the satellite check: ${error.message}`);
    }
    return null; // Return null to indicate the check was inconclusive.
  }
}