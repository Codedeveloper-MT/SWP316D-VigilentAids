import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import { TextToSpeech } from "@capacitor-community/text-to-speech";
import { App } from "@capacitor/app";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/logins.css";

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const [ttsSupported, setTtsSupported] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechInterval, setSpeechInterval] = useState(null);

  useEffect(() => {
    setTtsSupported("speechSynthesis" in window || Capacitor.isNativePlatform());

    // Speak on login page load
    speak("You are in the login page, provide username and password to login.");

    // Android back button handler
    if (Capacitor.isNativePlatform()) {
      const backListener = App.addListener('backButton', () => {
        console.log("Back button pressed, allowing exit.");
        // Allow the normal back button behavior
        App.exitApp(); // Exiting app on back button press (you can modify this as needed)
      });

      return () => {
        backListener.remove();
      };
    }
  }, []);

  const stopSpeech = () => {
    clearInterval(speechInterval);
    setIsSpeaking(false);
    if (Capacitor.isNativePlatform()) {
      TextToSpeech.stop();
    } else {
      window.speechSynthesis?.cancel();
    }
  };

  const speak = async (text) => {
    if (isSpeaking) return;
    setIsSpeaking(true);

    let repeatCount = 0;
    const maxRepeats = 3;

    const speakOnce = async () => {
      if (Capacitor.isNativePlatform()) {
        try {
          await TextToSpeech.speak({
            text: text,
            lang: "en-US",
            rate: 0.9,
            pitch: 1.0,
            volume: 1.0,
          });
        } catch (error) {
          console.error("Error speaking on mobile:", error);
        }
      } else if (ttsSupported) {
        window.speechSynthesis?.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "en-US";
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
      }
    };

    await speakOnce(); // Speak immediately

    const interval = setInterval(async () => {
      repeatCount++;
      if (repeatCount >= maxRepeats) {
        stopSpeech();
      } else {
        await speakOnce();
      }
    }, 6000);

    setSpeechInterval(interval);
  };

  const handleNavigation = (path) => {
    stopSpeech(); // Stop speaking before navigating
    if (Capacitor.isNativePlatform()) {
      window.location.hash = `#${path}`;
    } else {
      navigate(path);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (formData.username && formData.password) {
      const successMsg = "Login successful!...";
      setMessage(successMsg);
      speak(successMsg);
      setTimeout(() => handleNavigation("/screenPage"), 2000);
    } else {
      const errorMsg = "Please enter both username and password.";
      setMessage(errorMsg);
      speak(errorMsg);
    }
  };

  return (
    <div className="login-container">
      <h2 className="text-center mb-4">VigilentAids</h2>

      {message && (
        <p
          className={`message ${
            message.includes("success") ? "text-success" : "text-danger"
          }`}
        >
          {message}
        </p>
      )}

      <form onSubmit={handleLogin}>
        <div className="mb-3">
          <input
            type="text"
            className="form-control"
            name="username"
            placeholder="Username"
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
            onFocus={() => speak("Enter your Username")}
            required
          />
        </div>
        <div className="mb-3">
          <input
            type="password"
            className="form-control"
            name="password"
            placeholder="Password"
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            onFocus={() => speak("Enter your Password")}
            required
          />
        </div>

        <div className="d-grid gap-2">
          <button
            type="submit"
            className="btn btn-primary"
            onFocus={() => speak("Login button")}
          >
            Login
          </button>

          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => handleNavigation("/passwordPage")}
            onFocus={() => speak("Forget Password")}
          >
            Forget Password
          </button>

          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => handleNavigation("/registerPage")}
            onFocus={() => speak("Register Account")}
          >
            Register Account
          </button>
        </div>
      </form>

      {ttsSupported && <div className="tts-status"></div>}
    </div>
  );
};

export default LoginPage;
