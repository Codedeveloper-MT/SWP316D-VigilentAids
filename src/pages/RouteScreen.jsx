import React, { useEffect, useState, useRef, useCallback } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import polyline from "polyline";
import { Geolocation } from "@capacitor/geolocation";
import { App } from "@capacitor/app";
import { TextToSpeech } from "@capacitor-community/text-to-speech";
import { Input } from "@nextui-org/react";
import Button from "../pages/button";
import { useNavigate } from "react-router-dom";
import "../styles/RouteScreen.css";

const RouteScreen = () => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [destination, setDestination] = useState("");
  const [routeDetails, setRouteDetails] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const navigate = useNavigate();

  const speak = useCallback(async (text) => {
    try {
      await TextToSpeech.speak({
        text,
        lang: "en-US",
        rate: 0.9,
        pitch: 1.2,
        volume: 1.0,
      });
    } catch (error) {
      console.error("Error with Text-to-Speech:", error);
    }
  }, []);

  useEffect(() => {
    const handleAndroidBackButton = () => {
      App.addListener("backButton", () => {
        navigate("/screenPage");
      });
    };

    handleAndroidBackButton();

    return () => {
      App.removeAllListeners();
    };
  }, [navigate]);

  const drawRouteOnMap = useCallback((geometry) => {
    if (!mapRef.current || !currentLocation) return;

    const map = mapRef.current;

    if (map.getSource("route")) {
      map.removeLayer("route");
      map.removeSource("route");
    }

    const coordinates = polyline.decode(geometry);
    const formattedCoords = coordinates.map((coord) => [coord[1], coord[0]]);

    map.addSource("route", {
      type: "geojson",
      data: {
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates: formattedCoords,
        },
      },
    });

    map.addLayer({
      id: "route",
      type: "line",
      source: "route",
      layout: {
        "line-join": "round",
        "line-cap": "round",
      },
      paint: {
        "line-color": "#E63946",
        "line-width": 4,
        "line-opacity": 0.8,
      },
    });

    if (formattedCoords.length > 0) {
      const bounds = new maplibregl.LngLatBounds(
        formattedCoords[0],
        formattedCoords[0]
      );

      formattedCoords.forEach((coord) => {
        bounds.extend(coord);
      });

      map.fitBounds(bounds, {
        padding: 50,
        maxZoom: 15,
      });
    }
  }, [currentLocation]);

  useEffect(() => {
    if (!currentLocation || !mapContainerRef.current || mapRef.current) return;

    mapRef.current = new maplibregl.Map({
      container: mapContainerRef.current,
      style: "https://demotiles.maplibre.org/style.json",
      center: [currentLocation[1], currentLocation[0]],
      zoom: 14,
    });

    new maplibregl.Marker({ color: "#E63946" })
      .setLngLat([currentLocation[1], currentLocation[0]])
      .addTo(mapRef.current);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [currentLocation]);

  useEffect(() => {
    const getCurrentLocation = async () => {
      try {
        const position = await Geolocation.getCurrentPosition();
        setCurrentLocation([position.coords.latitude, position.coords.longitude]);
        speak("Location detected successfully");
      } catch (error) {
        console.error("Error fetching location:", error);
        setError("Could not get your current location");
        speak("Could not detect your location");
      }
    };
    getCurrentLocation();
  }, [speak]);

  const formatDuration = (minutes) => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${minutes}m`;
  };

  const getCoordinates = async (address) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
      );
      const data = await response.json();
      if (data.length > 0) {
        return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
      }
      throw new Error("Geocoding failed");
    } catch (error) {
      console.error("Geocoding error:", error);
      setError("Could not find destination coordinates.");
      speak("Could not find your destination.");
      return null;
    }
  };

  const getRoute = async (origin, destination) => {
    setIsLoading(true);
    setError("");
    speak("Calculating your route");

    try {
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${origin[1]},${origin[0]};${destination[1]},${destination[0]}?overview=full&geometries=polyline`
      );
      const data = await response.json();

      if (!data.routes || data.routes.length === 0) {
        throw new Error("No route found");
      }

      const route = data.routes[0];
      const distanceKm = (route.distance / 1000).toFixed(1);
      const durationText = formatDuration(Math.round(route.duration / 60));

      setRouteDetails({
        distance: parseFloat(distanceKm),
        duration: durationText,
      });

      speak(`Your route is ${distanceKm} kilometers long and will take approximately ${durationText}.`);
      drawRouteOnMap(route.geometry);
    } catch (error) {
      console.error("Route calculation error:", error);
      setError("Error calculating route.");
      speak("Route cannot be calculated. Please check the spelling or try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCalculateRoute = async () => {
    if (!currentLocation || !destination) {
      setError("Please enter a destination");
      speak("Please enter a destination");
      return;
    }
    const destinationCoords = await getCoordinates(destination);
    if (destinationCoords) {
      await getRoute(currentLocation, destinationCoords);
    }
  };

  const handleBack = () => {
    navigate("/screenPage");
  };

  return (
    <div className="route-screen">
      <div ref={mapContainerRef} id="map" className="map-container"></div>
      <div className="route-content">
        <Input
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          placeholder="Enter your destination"
          fullWidth
          style={{ backgroundColor: "#FFFFFF", color: "#1A1A1A" }}
        />
        <Button onClick={handleCalculateRoute} disabled={isLoading}>
          {isLoading ? "Calculating..." : "Calculate Route"}
        </Button>
        <Button onClick={handleBack} className="back-button">
          Back
        </Button>

        {error && <div className="error-message">{error}</div>}

        {routeDetails && (
          <div className="route-summary">
            <p><strong>Distance:</strong> {routeDetails.distance} km</p>
            <p><strong>Duration:</strong> {routeDetails.duration}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RouteScreen;