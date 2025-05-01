import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { TextToSpeech } from "@capacitor-community/text-to-speech";
import { App } from "@capacitor/app";
import "../styles/LocationScreen.css";

const LocationScreen = () => {
  const [coordinates, setCoordinates] = useState(null);
  const [fullAddress, setFullAddress] = useState("");
  const [displayAddress, setDisplayAddress] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const speechQueueRef = useRef([]);
  const isSpeakingRef = useRef(false);
  const navigate = useNavigate();

  const speak = async (text, interrupt = false) => {
    try {
      if (interrupt) {
        await TextToSpeech.stop();
        speechQueueRef.current = [];
        isSpeakingRef.current = false;
      }

      await TextToSpeech.speak({
        text,
        lang: "en-US",
        rate: 0.85,
        pitch: 1.0,
        volume: 1.0,
      });

      isSpeakingRef.current = false;
    } catch (error) {
      console.error("Error with Text-to-Speech:", error);
    }
  };

  const formatAddress = (address) => {
    const street = address.road
      ? `${address.road}${address.house_number ? " " + address.house_number : ""}`
      : null;
    const city = address.town || address.city || address.village || address.suburb;
    const region = address.state || address.county;

    const fullAddressParts = [street, city, region, address.postcode, address.country]
      .filter(Boolean)
      .join(", ");

    const displayParts = [street, city, region].filter(Boolean).join(", ");

    return {
      full: fullAddressParts || "Your current location",
      display: displayParts || "Your current location",
    };
  };

  const getAddress = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
      );
      const data = await response.json();

      if (data.address) {
        const formatted = formatAddress(data.address);
        speak(`Your current location is ${formatted.display}`);
        return formatted;
      }
      return { full: "Your current location", display: "Your current location" };
    } catch (error) {
      console.error("Error fetching address:", error);
      speak("Unable to determine your exact location");
      return { full: "Your current location", display: "Your current location" };
    }
  };

  const getLocation = async () => {
    setIsLoading(true);
    setError(null);
    speak("Getting your location", true);

    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      speak("Geolocation is not supported by this browser.", true);
      setIsLoading(false);
      return;
    }

    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0,
        });
      });

      const { latitude, longitude } = position.coords;
      setCoordinates({ lat: latitude, lng: longitude });

      const { full, display } = await getAddress(latitude, longitude);
      setFullAddress(full);
      setDisplayAddress(display);
    } catch (err) {
      let errorMessage = "Unable to retrieve your location";
      if (err.code === err.PERMISSION_DENIED) {
        errorMessage = "Location access was denied";
      } else if (err.code === err.TIMEOUT) {
        errorMessage = "Location request timed out";
      } else if (err.code === err.POSITION_UNAVAILABLE) {
        errorMessage = "Location information unavailable";
      }

      setError(errorMessage);
      speak(errorMessage, true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getLocation();

    const handleAndroidBackButton = () => {
      App.addListener("backButton", () => {
        navigate("/screenPage");
      });
    };

    handleAndroidBackButton();

    return () => {
      App.removeAllListeners();
      TextToSpeech.stop();
    };
  }, [navigate]);

  const shareLocation = () => {
    speak("Share on WhatsApp", true);
    if (coordinates) {
      const coordText = `(Latitude: ${coordinates.lat.toFixed(4)}, Longitude: ${coordinates.lng.toFixed(4)})`;
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
        `I'm currently at ${fullAddress}. ${coordText}`
      )}`;
      window.open(whatsappUrl, "_blank");
    } else {
      speak("Please wait while we get your location.", true);
    }
  };

  const handleBack = () => {
    navigate("/screenPage");
  };

  const handleRefresh = () => {
    speak(error ? "Try again" : "Refresh location", true);
    getLocation();
  };

  return (
    <div className="location-screen">
      <div className="location-decoration location-decoration-top"></div>
      <div className="location-decoration location-decoration-bottom"></div>

      <button
        onClick={handleBack}
        className="location-back-button"
        onFocus={() => speak("Back button", true)}
      >
        ← Back
      </button>

      {isLoading ? (
        <div className="location-loading">
          <div className="location-spinner"></div>
          <p>Finding your location...</p>
        </div>
      ) : (
        <div className="location-card">
          <h1 className="location-title">
            <span>Location</span> Finder
          </h1>

          {error ? (
            <div className="location-error">{error}</div>
          ) : (
            <div className="location-info">
              <div className="location-address">You are at:</div>
              <div className="location-place-name">{displayAddress}</div>
            </div>
          )}

          <div className="location-actions">
            <button
              onClick={handleRefresh}
              className="location-button button-primary"
              onFocus={() => speak(error ? "Try again" : "Refresh location", true)}
            >
              {error ? "Try Again" : "Refresh Location"}
            </button>
            <button
              onClick={shareLocation}
              className={`location-button ${coordinates ? "button-secondary" : "button-disabled"}`}
              disabled={!coordinates}
              onFocus={() => speak("Share on WhatsApp", true)}
            >
              Share on WhatsApp
            </button>
          </div>
        </div>
      )}

      <div className="location-footer">
        <p>Your privacy is important to us</p>
      </div>
    </div>
  );
};

export default LocationScreen;