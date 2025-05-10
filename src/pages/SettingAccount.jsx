import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { App } from '@capacitor/app';
import { Button, Typography, Container, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import "../styles/SettingAccount.css";

const SettingAccount = () => {
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const speak = (text) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    speak("You are about to set up your account. Update your Account, Delete your account, or access other settings.");
  }, []);

  useEffect(() => {
    const handleAndroidBackButton = () => {
      App.addListener("backButton", () => {
        speak("Navigating back to the main screen.");
        navigate("/screenPage");
      });
    };

    handleAndroidBackButton();

    return () => {
      App.removeAllListeners();
    };
  }, [navigate]);

  const handleNavigateToBack = () => {
    speak("Navigating back to the main screen.");
    navigate("/screenPage");
  };

  const handleDeleteAccount = () => {
    setDeleteDialogOpen(true);
    speak("Are you sure you want to delete your account?,This action cannot be undone.");
  };

  const handleDeleteConfirm = (confirm) => {
    setDeleteDialogOpen(false);
    if (confirm) {
      speak("Deleted successfully.");
      navigate("/");
    } else {
      speak("Account deletion canceled.");
    }
  };

  return (
    <Container maxWidth="sm" className="settings-container">
      <Typography variant="h4" align="center" gutterBottom className="settings-title">
        My Account Settings
      </Typography>
      <Button
        variant="contained"
        fullWidth
        className="settings-button"
        onClick={() => {
          window.speechSynthesis.cancel();
          navigate('/vee-settings');
        }}
        sx={{ mb: 2 }}
      >
        Vee Assistance Settings
      </Button>
      <Button
        variant="contained"
        fullWidth
        className="settings-button"
        onClick={() => {
          window.speechSynthesis.cancel();
          navigate('/update');
        }}
        sx={{ mb: 2 }}
      >
        Update My Account
      </Button>

      <Button
        variant="outlined"
        color="error"
        fullWidth
        className="settings-button"
        onClick={handleDeleteAccount}
        sx={{ mb: 2 }}
      >
        Delete My Account
      </Button>

      <Button 
        variant="outlined"
        fullWidth
        onClick={handleNavigateToBack}
        className="back-button"
      >
        Back to Main Menu
      </Button>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => handleDeleteConfirm(false)}
      >
        <DialogTitle>Confirm Account Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete your account? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleDeleteConfirm(false)} color="primary">
            No
          </Button>
          <Button onClick={() => handleDeleteConfirm(true)} color="error" autoFocus>
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SettingAccount;