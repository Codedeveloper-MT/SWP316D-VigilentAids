import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { App } from '@capacitor/app';  // Updated import
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Box,
  IconButton
} from '@mui/material';
import { VolumeUp, ArrowBack } from '@mui/icons-material';

const PasswordPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Speech synthesis using Web Speech API with Capacitor fallback
  const speak = async (text) => {
    // First try Web Speech API (works in both web and Capacitor)
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
      return;
    }

    // Fallback to Capacitor Text-to-Speech if available
    if (typeof TextToSpeech !== 'undefined') {
      try {
        await TextToSpeech.speak({
          text: text,
          lang: 'en-US',
          rate: 1.0,
          pitch: 1.0,
          volume: 1.0,
        });
      } catch (err) {
        console.error('Speech synthesis failed:', err);
      }
    }
  };

  // Initial greeting when component mounts
  useEffect(() => {
    speak("Forgot password page. Please enter your username to retrieve your password.");
    
    // Handle Android back button
    const backHandler = App.addListener('backButton', ({ canGoBack }) => {
      if (!canGoBack) {
        handleBack();
      }
    });

    return () => {
      window.speechSynthesis?.cancel();
      backHandler.remove();
    };
  }, []);

  // Speak password when it's retrieved
  useEffect(() => {
    if (password) {
      speak(`Your password is ${password.split('').join(' ')}. You can now login.`);
    }
  }, [password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    setPassword('');
    
    try {
      const response = await axios.post('http://localhost:5000/api/forgot-password', { username });
      
      if (response.data.success) {
        setPassword(response.data.password);
        const successMessage = "Password retrieved successfully";
        setMessage(successMessage);
        await speak(successMessage);
      } else {
        throw new Error(response.data.error || 'Failed to retrieve password');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Password retrieval failed. Please check your username.';
      setError(errorMessage);
      await speak(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = async () => {
    await speak("Going back to previous page");
    navigate(-1);
  };

  const handleSpeakInstructions = async () => {
    await speak("Enter your username and tap retrieve password. Or tap back to return.");
  };

  const handleGoToLogin = async () => {
    await speak("Navigating to login page");
    navigate('/login');
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <IconButton onClick={handleBack} aria-label="go back">
            <ArrowBack />
          </IconButton>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Forgot Password
          </Typography>
          <IconButton onClick={handleSpeakInstructions} aria-label="hear instructions">
            <VolumeUp />
          </IconButton>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
            <IconButton size="small" onClick={() => speak(error)}>
              <VolumeUp fontSize="small" />
            </IconButton>
          </Alert>
        )}
        {message && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {message}
            <IconButton size="small" onClick={() => speak(message)}>
              <VolumeUp fontSize="small" />
            </IconButton>
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            fullWidth
            margin="normal"
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            disabled={loading}
            onFocus={() => speak("Enter your username")}
          />
          
          <Button
            fullWidth
            variant="contained"
            type="submit"
            disabled={loading || !username.trim()}
            sx={{ mt: 2, mb: 1 }}
            onFocus={() => speak("Tap to retrieve password")}
          >
            {loading ? 'Retrieving...' : 'Retrieve Password'}
          </Button>
        </Box>

        {password && (
          <Box sx={{ mt: 3, p: 2, border: '1px solid #ccc', borderRadius: 1 }}>
            <Typography variant="h6" gutterBottom>
              Your Password:
            </Typography>
            <Typography variant="body1" sx={{ fontFamily: 'monospace', mb: 2 }}>
              {password}
            </Typography>
            <Button
              fullWidth
              variant="contained"
              onClick={() => speak(`Your password is ${password.split('').join(' ')}`)}
              sx={{ mb: 2 }}
              startIcon={<VolumeUp />}
            >
              Hear Password Again
            </Button>
            <Button
              fullWidth
              variant="outlined"
              onClick={handleGoToLogin}
              startIcon={<ArrowBack />}
            >
              Go to Login
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default PasswordPage;