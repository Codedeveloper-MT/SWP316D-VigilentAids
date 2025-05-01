import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { App } from "@capacitor/app";
import { TextToSpeech } from "@capacitor-community/text-to-speech";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/HomeScreen.css";

const ScreenPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const backButtonHandler = ({ canGoBack }) => {
      if (!canGoBack) {
        navigate("/HomePage");
      }
    };

    const backListener = App.addListener("backButton", backButtonHandler);
    return () => {
      backListener.remove();
    };
  }, [navigate]);

  // Speak text using Capacitor's TextToSpeech or fallback to Web Speech API
  const speak = async (text) => {
    try {
      await TextToSpeech.speak({
        text: text,
        lang: "en-US",
        rate: 1.0,
        pitch: 1.0,
        volume: 1.0,
        category: "ambient",
      });
    } catch (error) {
      if ("speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "en-US";
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
      }
    }
  };

  const handleButtonHover = (text) => {
    speak(text);
  };

  

  return (
    <div className="home-container">
      <div className="content-wrapper">
        <div className="title-group">
          <h1 className="main-title">
            Vigilent<span className="title-accent">Aids</span>
          </h1>
          <div className="animated-underline"></div>
          <p className="subtitle">Your Intelligent Assistance Portal</p>
        </div>

          <Link
            to="/location"
            className="nav-button direction-button"
            onMouseEnter={() => handleButtonHover("Current Location")}
            onFocus={() => handleButtonHover("Current Location")}
          >
            <span className="button-icon">📍</span>
            <span className="button-text">Current Location</span>
          </Link>

          <Link
            to="/routes"
            className="nav-button direction-button"
            onMouseEnter={() => handleButtonHover("Get Routes")}
            onFocus={() => handleButtonHover("Get Routes")}
          >
            <span className="button-icon">🗺️</span>
            <span className="button-text">Get Routes</span>
          </Link>

          <Link
            to="/camera"
            className="nav-button camera-button"
            onMouseEnter={() => handleButtonHover("Vigilent Eye")}
            onFocus={() => handleButtonHover("Vigilent Eye")}
          >
            <span className="button-icon">👁️</span>
            <span className="button-text">Vigilent Eye</span>
          </Link>

          <Link
            to="/vee"
            className="nav-button settings-button"
            onMouseEnter={() => handleButtonHover("Vee Assistance")}
            onFocus={() => handleButtonHover("Vee Assistance")}
          >
            <span className="button-icon">🤖</span>
            <span className="button-text">Vee Assistance</span>
          </Link>

          <Link
            to="/messages"
            className="nav-button messages-button"
            onMouseEnter={() => handleButtonHover("Messages")}
            onFocus={() => handleButtonHover("Messages")}
          >
            <span className="button-icon">✉️</span>
            <span className="button-text">Messages</span>
          </Link>

          <Link
            to="/settings"
            className="nav-button settings-button"
            onMouseEnter={() => handleButtonHover("Account Settings")}
            onFocus={() => handleButtonHover("Account Settings")}
          >
            <span className="button-icon">⚙️</span>
            <span className="button-text">Account Settings</span>
          </Link>
        


      </div>

      <div className="background-pattern"></div>
      <div className="corner-decoration top-left"></div>
      <div className="corner-decoration top-right"></div>
      <div className="corner-decoration bottom-left"></div>
      <div className="corner-decoration bottom-right"></div>
    </div>
  );
};

export default ScreenPage;
