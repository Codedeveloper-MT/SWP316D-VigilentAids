import React, { useEffect, useState } from "react";
import { startAssistant, stopAssistant } from "./ai";
import { useNavigate } from "react-router-dom";
import { App } from "@capacitor/app";
import "bootstrap/dist/css/bootstrap.min.css";
import { Button, Container, Row, Badge } from "react-bootstrap";

function VeeScreen() {
  const [assistantActive, setAssistantActive] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const navigate = useNavigate();

  const speak = (text) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.2;
      utterance.lang = "en-US";

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);

      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    } else {
      console.warn("Speech synthesis not supported in this browser.");
    }
  };

  useEffect(() => {
    const handleMobileBackButton = () => {
      App.addListener("backButton", () => {
        speak("Navigating back to the main screen.");
        navigate("/screenPage");
      });
    };

    handleMobileBackButton();

    return () => {
      App.removeAllListeners();
    };
  }, [navigate]);

  useEffect(() => {
    const initializeAssistant = async () => {
      try {
        await startAssistant();
        setAssistantActive(true);
        speak("Initializing Vee assistant.");
      } catch (error) {
        console.error("Error initializing assistant:", error);
        speak("System malfunction detected. Please try reactivating me.");
      }
    };

    initializeAssistant();
    return () => stopAssistant();
  }, []);

  const handleActivate = async () => {
    try {
      await startAssistant();
      setAssistantActive(true);
      speak("Vee Assistant activated.");
    } catch (error) {
      console.error("Error activating assistant:", error);
      speak("Failed to activate Vee Assistant.");
    }
  };

  const handleDeactivate = async () => {
    try {
      await stopAssistant();
      setAssistantActive(false);
      speak("Vee Assistant deactivated.");
    } catch (error) {
      console.error("Error deactivating assistant:", error);
      speak("Failed to deactivate Vee Assistant.");
    }
  };

  const handleBack = () => {
    speak("Navigating back to the main screen.");
    navigate("/screenPage");
  };

  return (
    <Container fluid className="vee-container bg-black text-white min-vh-100 p-4 d-flex flex-column">
      <Row className="text-center mb-4">
        <h1 className="text-danger fw-bold mb-0">VEE ASSISTANT</h1>
        <Badge bg="danger" className="rounded-pill px-3 fs-6 mb-3">v2.0</Badge>
        <div className="d-flex justify-content-center align-items-center mb-3">
          <div
            className={`status-indicator ${assistantActive ? "bg-danger pulse" : "bg-secondary"} rounded-circle me-2`}
            style={{ width: "12px", height: "12px" }}
          ></div>
          <small className={`fw-bold ${assistantActive ? "text-danger" : "text-white"}`}>
            {assistantActive ? "ACTIVE • LISTENING" : "STANDBY"}
          </small>
        </div>
      </Row>

      <Row className="mt-auto mb-4">
        <Button
          variant={assistantActive ? "outline-danger" : "danger"}
          size="lg"
          className="w-100 mb-3 py-3 fw-bold border-3"
          onClick={handleActivate}
          disabled={assistantActive}
        >
          {assistantActive ? "ASSISTANT ACTIVE" : "ACTIVATE ASSISTANT"}
        </Button>

        <Button
          variant={assistantActive ? "danger" : "outline-danger"}
          size="lg"
          className="w-100 mb-3 py-3 fw-bold border-3"
          onClick={handleDeactivate}
          disabled={!assistantActive}
        >
          DEACTIVATE ASSISTANT
        </Button>

        <Button
          variant="outline-light"
          size="lg"
          className="w-100 py-3 fw-bold border-3"
          onClick={handleBack}
        >
          BACK TO MAIN MENU
        </Button>
      </Row>
    </Container>
  );
}

export default VeeScreen;