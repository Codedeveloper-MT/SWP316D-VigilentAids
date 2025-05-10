import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import { TextToSpeech } from "@capacitor-community/text-to-speech";
import { App } from "@capacitor/app";
import AOS from "aos";
import "aos/dist/aos.css";
import '../styles/logins.css';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    AOS.init();
    speak("You are on the login page. Please enter your username and password.");
    const backButtonHandler = App.addListener("backButton", ({ canGoBack }) => {
      if (!canGoBack) {
        speak("Exiting the app.");
        App.exitApp();
      }
    });

    return () => {
      backButtonHandler.remove();
    };
  }, []);

  const speak = async (text) => {
    try {
      await TextToSpeech.speak({
        text,
        lang: "en-US",
        rate: 1.0,
        pitch: 1.0,
      });
    } catch (error) {
      console.error("TextToSpeech error:", error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/api/login", formData);
      if (response.data.success) {
        const successMessage = "Login successful! Redirecting to the update page.";
        setMessage(successMessage);
        await speak(successMessage);
        localStorage.setItem("loggedInUsername", formData.username);
        setTimeout(() => {
          navigate("/screenPage");
        }, 2000);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || "Invalid username or password.";
      setMessage(errorMessage);
      await speak(errorMessage);
    }
  };

  const handleNavigateToRegister = async () => {
    await speak("Navigating to the registration page.");
    navigate("/registerPage");
  };

  const handleNavigateToForgotPassword = async () => {
    await speak("Navigating to the forgot password page.");
    navigate("/forgot-password");
  };

  return (
    <div>
      <div>
        <h2>🔐 VigilentAids</h2>
        {message && <p>{message}</p>}

        <form onSubmit={handleLogin}>
          <div>
            <label>Username</label>
            <input
              type="text"
              name="username"
              placeholder="Enter your username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit">Login</button>

          <button
            type="button"
            onClick={handleNavigateToForgotPassword}
          >
            Forgot Password?
          </button>

          <button
            type="button"
            onClick={handleNavigateToRegister}
          >
            Create New Account
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
