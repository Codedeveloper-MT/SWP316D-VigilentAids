import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { App } from "@capacitor/app";
import { Toast } from "@capacitor/toast";
import axios from "axios";
import {
  TextField,
  Button,
  Container,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import "../styles/update.css";

const UserUpdate = () => {
  const [formData, setFormData] = useState({
    country: "",
    phone: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const navigate = useNavigate();

  const speak = async (text) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    speak("You are about to update your account. Please enter your details.");
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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdate = async () => {
    const username = localStorage.getItem("loggedInUsername");

    if (!username) {
      setMessage("Error: No logged-in user found.");
      await Toast.show({ text: "Error: No logged-in user found." });
      return;
    }

    try {
      const response = await axios.put("http://localhost:5000/api/update", {
        username,
        ...formData,
      });

      if (response.data.success) {
        setMessage("User details updated successfully!");
        await Toast.show({ text: "User details updated successfully!" });
        setTimeout(() => {
          navigate("/delete");
        }, 2000);
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || "An error occurred while updating details.";
      setMessage(errorMessage);
      await Toast.show({ text: errorMessage });
    }
  };

  const handleConfirmDialogClose = async (confirm) => {
    setConfirmDialogOpen(false);
    if (confirm) {
      await handleUpdate();
    }
  };

  return (
    <Container>
      <div className="update-container">
        <h2>Update Your Details</h2>
        {message && <Alert severity="info">{message}</Alert>}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            setConfirmDialogOpen(true);
          }}
        >
          <TextField
            fullWidth
            margin="normal"
            label="Country"
            name="country"
            value={formData.country}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Phone Number"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            margin="normal"
            label="New Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
          />
          <Button type="submit" variant="contained" color="primary">
            Update
          </Button>
        </form>
      </div>

      <Dialog
        open={confirmDialogOpen}
        onClose={() => handleConfirmDialogClose(false)}
      >
        <DialogTitle>Confirm Changes</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You have made changes to your account. Do you want to proceed with
            the update?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleConfirmDialogClose(false)} color="error">
            No
          </Button>
          <Button onClick={() => handleConfirmDialogClose(true)} color="primary" autoFocus>
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UserUpdate;