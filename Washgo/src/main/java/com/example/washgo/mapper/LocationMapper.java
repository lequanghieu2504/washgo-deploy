package com.example.washgo.mapper;

import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.utils.URIBuilder;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.util.EntityUtils;
import org.json.JSONArray;
import org.json.JSONObject;
import org.slf4j.Logger; // Import Logger
import org.slf4j.LoggerFactory; // Import LoggerFactory


public class LocationMapper {

    // --- Add Logger ---
    private static final Logger logger = LoggerFactory.getLogger(LocationMapper.class);

    private static final String NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
    // --- IMPORTANT: REPLACE THIS User-Agent ---
    private static final String NOMINATIM_USER_AGENT = "MyWashGoApp/1.0 (my.email@example.com)"; // REPLACE THIS

    public String convertToLongitude(String location) {
        try {
            String response = getCoordinates(location);
            if (response == null) return null; // Handle API call failure

            JSONArray jsonArray = new JSONArray(response);
            if (jsonArray.length() == 0) {
                logger.warn("Nominatim returned no results for address: '{}'", location); // Use logger
                return null;
            }

            JSONObject jsonResponse = jsonArray.getJSONObject(0);
            // Check if keys exist before accessing
            if (jsonResponse.has("lon")) {
                double longitude = jsonResponse.getDouble("lon");
                return String.valueOf(longitude);
            } else {
                logger.warn("Nominatim response for '{}' missing 'lon' field.", location);
                return null;
            }
        } catch (Exception e) {
            logger.error("Error converting location '{}' to longitude", location, e); // Use logger instead of printStackTrace
            return null; // Return null on error
        }
    }

    public String convertToLatitude(String location) {
        try {
            String response = getCoordinates(location);
            if (response == null) return null; // Handle API call failure

            JSONArray jsonArray = new JSONArray(response);
            if (jsonArray.length() == 0) {
                logger.warn("Nominatim returned no results for address: '{}'", location); // Use logger
                return null;
            }

            JSONObject jsonResponse = jsonArray.getJSONObject(0);
            // Check if keys exist before accessing
            if (jsonResponse.has("lat")) {
                double latitude = jsonResponse.getDouble("lat");
                return String.valueOf(latitude);
            } else {
                logger.warn("Nominatim response for '{}' missing 'lat' field.", location);
                return null;
            }
        } catch (Exception e) {
            logger.error("Error converting location '{}' to latitude", location, e); // Use logger instead of printStackTrace
            return null; // Return null on error
        }
    }

    // Make this method return null on failure for easier checking
    private String getCoordinates(String location) {
        if (location == null || location.isBlank()) {
            logger.warn("getCoordinates called with blank location.");
            return null;
        }
        try {
            URIBuilder builder = new URIBuilder(NOMINATIM_URL);
            builder.setParameter("q", location);
            builder.setParameter("format", "json");
            builder.setParameter("limit", "1"); // Limit to 1 result

            CloseableHttpClient httpClient = HttpClients.createDefault();
            HttpGet request = new HttpGet(builder.build());

            // --- Set the mandatory User-Agent header ---
            request.setHeader("User-Agent", NOMINATIM_USER_AGENT);
            // --- End User-Agent ---

            logger.info("Calling Nominatim for address: '{}'", location);
            try (CloseableHttpResponse response = httpClient.execute(request)) {
                int statusCode = response.getStatusLine().getStatusCode();
                String responseBody = EntityUtils.toString(response.getEntity());
                if (statusCode >= 200 && statusCode < 300) {
                    logger.debug("Nominatim response for '{}': {}", location, responseBody);
                    return responseBody;
                } else {
                    logger.error("Nominatim request failed for '{}'. Status: {}, Body: {}", location, statusCode, responseBody);
                    return null;
                }
            }
        } catch (Exception e) {
            logger.error("Exception during Nominatim API call for location '{}'", location, e);
            return null;
        }
    }
}
