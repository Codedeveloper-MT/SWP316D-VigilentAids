import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, TextField, Button, Typography, Container,
  Alert, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle
} from '@mui/material';
import "../styles/update.css";

const UserUpdate = () => {
  const [country, setCountry] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const navigate = useNavigate();

  const speak = (text) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    speak("You are about to update your account. Please enter your details.");
  }, []);

  const handleUpdate = () => {
    if (!country.trim() && !phone.trim() && !password.trim()) {
      setError("Nothing to update.");
      speak("Nothing to update.");
      return;
    }
    setConfirmDialogOpen(true);
    speak("You have made changes. Do you want to proceed?");
  };

  const handleConfirmDialogClose = async (proceed) => {
    setConfirmDialogOpen(false);
    if (proceed) {
      setLoading(true);
      setError('');
      setSuccess('');
      try {
        // Simulate an API call to update user details
        await new Promise((resolve) => setTimeout(resolve, 2000));
        setSuccess('Your account has been updated successfully!');
        speak("Your account has been updated successfully!");
        setCountry('');
        setPhone('');
        setPassword('');
      } catch (err) {
        speak("Failed to update your details");
        setError('Failed to update your details. Please try again.');
      } finally {
        setLoading(false);
      }
    } else {
      speak("Update canceled.");
    }
  };

  const handleBack = () => {
    window.speechSynthesis.cancel();
    navigate(-1);
  };

  const handleFieldFocus = (fieldName) => {
    speak(`Enter your ${fieldName}`);
  };

  return (
    <Container maxWidth="sm" className="update-container" sx={{ mt: 8 }}>
      <Typography variant="h4" component="h1" className="update-title" gutterBottom align="center">
        Update Account
      </Typography>

      {error && (
        <Alert severity="error" className="update-alert" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" className="update-success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      <Box component="form" className="update-form" onSubmit={(e) => { e.preventDefault(); handleUpdate(); }}>
        <TextField
          className="update-input"
          InputLabelProps={{ className: "update-input-label" }}
          fullWidth
          margin="normal"
          label="Country"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          onFocus={() => handleFieldFocus("country")}
        />
        <TextField
          className="update-input"
          InputLabelProps={{ className: "update-input-label" }}
          fullWidth
          margin="normal"
          label="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          onFocus={() => handleFieldFocus("phone number")}
        />
        <TextField
          className="update-input"
          InputLabelProps={{ className: "update-input-label" }}
          fullWidth
          margin="normal"
          label="New Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onFocus={() => handleFieldFocus("new password")}
        />
        <Button
          className="update-button"
          fullWidth
          variant="contained"
          disabled={loading}
          sx={{ mt: 3, mb: 2, py: 1.5 }}
          type="submit"
        >
          {loading ? <CircularProgress size={24} className="update-spinner" /> : 'Update Details'}
        </Button>
        <Button
          fullWidth
          variant="outlined"
          onClick={handleBack}
          sx={{ mt: 1, mb: 2 }}
        >
          Back
        </Button>
      </Box>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={() => handleConfirmDialogClose(false)}
      >
        <DialogTitle>Confirm Changes</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You have made changes to your account. Do you want to proceed with the update?
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