import React, { useState, useEffect } from "react";
import { CameraPreview } from "@capacitor-community/camera-preview";
import { App } from "@capacitor/app"; // Import the App plugin
import { Button, Box, Typography, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom"; // For navigation

const CameraPage = () => {
  const [cameraDirection, setCameraDirection] = useState("rear"); // State to toggle between front and back cameras
  const [photo, setPhoto] = useState(null); // State to store the captured photo
  const [isCameraActive, setIsCameraActive] = useState(false); // State to track if the camera is active
  const navigate = useNavigate(); // React Router navigation

  const startCamera = async () => {
    try {
      await CameraPreview.start({
        position: cameraDirection,
        parent: "cameraPreview", // The ID of the container for the camera preview
        className: "camera-preview", // Optional CSS class for styling
      });
      setIsCameraActive(true);
    } catch (error) {
      console.error("Error starting camera:", error);
    }
  };

  const stopCamera = async () => {
    try {
      await CameraPreview.stop();
      setIsCameraActive(false);
    } catch (error) {
      console.error("Error stopping camera:", error);
    }
  };

  const takePicture = async () => {
    try {
      const result = await CameraPreview.capture({
        quality: 90,
      });
      setPhoto(`data:image/jpeg;base64,${result.value}`); // Save the captured photo
      stopCamera(); // Stop the camera after taking the picture
    } catch (error) {
      console.error("Error taking picture:", error);
    }
  };

  const toggleCamera = async () => {
    const newDirection = cameraDirection === "rear" ? "front" : "rear";
    setCameraDirection(newDirection);
    if (isCameraActive) {
      await stopCamera();
      await startCamera();
    }
  };

  const handleBackButton = async () => {
    if (isCameraActive) {
      await stopCamera(); // Stop the camera if it's active
    }
    navigate("/screenPage"); // Navigate back to the home page or previous screen
  };

  useEffect(() => {
    const backButtonListener = App.addListener("backButton", handleBackButton);

    return () => {
      backButtonListener.remove(); // Clean up the listener when the component unmounts
    };
  }, [isCameraActive, navigate]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        backgroundColor: "#000000",
        color: "#ffffff",
        padding: 2,
      }}
    >
      <Typography variant="h4" sx={{ marginBottom: 3, fontWeight: "bold" }}>
        Camera App
      </Typography>

      <Box
        id="cameraPreview"
        sx={{
          width: "100%",
          height: "60%",
          backgroundColor: "#000000",
          border: "2px solid #ffffff",
          borderRadius: "10px",
          marginBottom: 3,
          display: isCameraActive ? "block" : "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {!isCameraActive && !photo && (
          <Typography
            variant="body1"
            sx={{
              color: "#ffffff",
              textAlign: "center",
            }}
          >
            Camera preview will appear here.
          </Typography>
        )}
      </Box>

      {photo ? (
        <Box
          component="img"
          src={photo}
          alt="Captured"
          sx={{
            width: "80%",
            height: "auto",
            borderRadius: "10px",
            marginBottom: 3,
            border: "2px solid #ffffff",
          }}
        />
      ) : null}

      {isCameraActive && (
        <Stack direction="row" spacing={2} sx={{ marginBottom: 2 }}>
          <Button
            variant="contained"
            onClick={takePicture}
            sx={{
              backgroundColor: "#ff0000",
              color: "#ffffff",
              "&:hover": {
                backgroundColor: "#cc0000",
              },
            }}
          >
            Take Picture
          </Button>
          <Button
            variant="outlined"
            onClick={toggleCamera}
            sx={{
              borderColor: "#ffffff",
              color: "#ffffff",
              "&:hover": {
                borderColor: "#cccccc",
                color: "#cccccc",
              },
            }}
          >
            Switch to {cameraDirection === "rear" ? "Front" : "Back"} Camera
          </Button>
          <Button
            variant="outlined"
            onClick={stopCamera}
            sx={{
              borderColor: "#ffffff",
              color: "#ffffff",
              "&:hover": {
                borderColor: "#cccccc",
                color: "#cccccc",
              },
            }}
          >
            Stop Camera
          </Button>
        </Stack>
      )}

      {photo && (
        <Button
          variant="outlined"
          onClick={() => setPhoto(null)}
          sx={{
            borderColor: "#ffffff",
            color: "#ffffff",
            "&:hover": {
              borderColor: "#cccccc",
              color: "#cccccc",
            },
          }}
        >
          Clear Photo
        </Button>
      )}

      {!isCameraActive && (
        <Button
          variant="contained"
          onClick={startCamera}
          sx={{
            backgroundColor: "#ff0000",
            color: "#ffffff",
            "&:hover": {
              backgroundColor: "#cc0000",
            },
          }}
        >
          Start Camera
        </Button>
      )}
    </Box>
  );
};

export default CameraPage;