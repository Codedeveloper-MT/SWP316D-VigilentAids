import React, { useState, useRef } from 'react';
import { CameraPreview } from '@capacitor-community/camera-preview';
import { TextToSpeech } from '@capacitor-community/text-to-speech';
import { Button, Box, Typography, Stack, Chip, CircularProgress } from '@mui/material';
import axios from 'axios';

const CameraPage = () => {
  const [cameraActive, setCameraActive] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [detections, setDetections] = useState([]);
  const [loading, setLoading] = useState(false);
  const cameraRef = useRef(null);

  // Start/Stop Camera
  const toggleCamera = async () => {
    if (cameraActive) {
      await CameraPreview.stop();
    } else {
      await CameraPreview.start({
        position: 'rear',
        parent: 'cameraPreview',
        width: window.innerWidth,
        height: window.innerHeight * 0.7,
        toBack: true
      });
    }
    setCameraActive(!cameraActive);
  };

  // Capture and Detect
  const captureAndDetect = async () => {
    setLoading(true);
    try {
        // Capture photo
        const { value } = await CameraPreview.capture({ quality: 90 });
        const photoSrc = `data:image/jpeg;base64,${value}`;
        setPhoto(photoSrc);

        // Convert to blob for API
        const blob = await (await fetch(photoSrc)).blob();
        const formData = new FormData();
        formData.append('image', blob, 'capture.jpg');

        // Send to YOLOv8 API
        const { data } = await axios.post('http://127.0.0.1:5000/detect', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        setDetections(data.detections);

        // Speak results
        if (data.detections.length > 0) {
            const objects = data.detections
                .map(d => `${d.class} (${Math.round(d.confidence * 100)}%)`)
                .join(', ');
            await TextToSpeech.speak({ text: `Detected: ${objects}` });
        } else {
            await TextToSpeech.speak({ text: 'No objects detected' });
        }
    } catch (error) {
        console.error('Detection error:', error);
        await TextToSpeech.speak({ text: 'Detection failed' });
    } finally {
        setLoading(false);
    }
  };

  return (
    <Box sx={{
      height: '100vh',
      bgcolor: '#121212',
      color: 'white',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Camera Preview */}
      <Box 
        id="cameraPreview"
        ref={cameraRef}
        sx={{
          flex: 1,
          position: 'relative',
          border: '2px solid #444',
          borderRadius: 2,
          m: 2,
          overflow: 'hidden'
        }}
      >
        {!cameraActive && (
          <Box sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: '#000'
          }}>
            <Typography>Camera is off</Typography>
          </Box>
        )}
      </Box>

      {/* Controls */}
      <Stack direction="row" spacing={2} sx={{ p: 2, justifyContent: 'center' }}>
        <Button
          variant="contained"
          color={cameraActive ? 'error' : 'success'}
          onClick={toggleCamera}
          disabled={loading}
        >
          {cameraActive ? 'Stop Camera' : 'Start Camera'}
        </Button>

        {cameraActive && (
          <Button
            variant="contained"
            color="primary"
            onClick={captureAndDetect}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {loading ? 'Processing...' : 'Detect Objects'}
          </Button>
        )}
      </Stack>

      {/* Results */}
      {photo && (
        <Box sx={{ p: 2, borderTop: '1px solid #444' }}>
          <Typography variant="h6" gutterBottom>
            Detection Results:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            {detections.map((d, i) => (
              <Chip
                key={i}
                label={`${d.class} (${Math.round(d.confidence * 100)}%)`}
                color="primary"
                variant="outlined"
              />
            ))}
          </Box>
          <Box
            component="img"
            src={photo}
            sx={{
              width: '100%',
              borderRadius: 2,
              border: '1px solid #444'
            }}
          />
        </Box>
      )}
    </Box>
  );
};

export default CameraPage;