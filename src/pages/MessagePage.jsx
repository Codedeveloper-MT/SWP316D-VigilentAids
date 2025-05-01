import React, { useState, useEffect } from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  Box,
  Divider,
  Paper,
} from "@mui/material";
import { App } from "@capacitor/app";
import { TextToSpeech } from "@capacitor-community/text-to-speech"; // Import TTS plugin
import { useNavigate } from "react-router-dom";
import "../styles/messages.css";

const MessagePage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [messageCount, setMessageCount] = useState(0);
  const [users] = useState(["John", "Jane", "Alice", "Bob"]); // Example user list
  const navigate = useNavigate();

  const speak = async (text) => {
    try {
      await TextToSpeech.speak({
        text: text,
        lang: "en-US",
        rate: 1.0,
        pitch: 1.0,
        volume: 1.0,
      });
    } catch (error) {
      console.error("Error with Text-to-Speech:", error);
    }
  };

  const handleSendMessage = () => {
    if (message.trim() === "") {
      speak("Message cannot be empty.");
      return;
    }

    if (messageCount >= 30) {
      speak("You have reached the daily message limit.");
      return;
    }

    setMessages((prevMessages) => [
      ...prevMessages,
      { user: selectedUser, text: message },
    ]);
    setMessage("");
    setMessageCount((prevCount) => prevCount + 1);
    speak(`You sent: ${message}`);
  };

  const handleRecord = () => {
    speak("Recording feature is not implemented yet.");
  };

  // Handle Android back button for mobile and navigate to /screenPage
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

  const handleBack = () => {
    speak("Navigating back to the main screen.");
    navigate("/screenPage");
  };

  const filteredUsers = users.filter((user) =>
    user.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container
      maxWidth="lg"
      sx={{
        mt: 4,
        display: "flex",
        height: "80vh",
        backgroundColor: "#000000", // Black background
        borderRadius: "10px",
        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
        overflow: "hidden",
      }}
    >
      {/* User List */}
      <Paper
        elevation={3}
        sx={{
          width: "30%",
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
          backgroundColor: "#ffffff", // White background
          borderRight: "1px solid #e0e0e0",
          position: "relative",
        }}
      >
        <Typography
          variant="h6"
          align="center"
          sx={{
            p: 2,
            backgroundColor: "#ff0000", // Red header
            color: "#ffffff", // White text
            fontWeight: "bold",
          }}
        >
          Users
        </Typography>
        <Divider />
        <TextField
          fullWidth
          label="Search Users"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{
            mb: 2,
            px: 2,
            "& .MuiOutlinedInput-root": {
              borderRadius: "20px",
            },
          }}
        />
        <List>
          {filteredUsers.map((user, index) => (
            <ListItem
              key={index}
              button
              selected={selectedUser === user}
              onClick={() => {
                setSelectedUser(user);
                speak(`Chatting with ${user}`);
              }}
              sx={{
                "&.Mui-selected": {
                  backgroundColor: "#ff0000", // Red for selected user
                  color: "#ffffff", // White text
                },
                "&:hover": {
                  backgroundColor: "#ffe5e5", // Light red hover
                },
              }}
            >
              <ListItemText primary={user} />
            </ListItem>
          ))}
        </List>
        {/* Back Button */}
        <Button
          variant="outlined"
          fullWidth
          onClick={handleBack}
          sx={{
            position: "absolute",
            bottom: 0,
            borderColor: "#ff0000", // Red border
            color: "#ff0000", // Red text
            "&:hover": {
              borderColor: "#cc0000", // Darker red hover
              color: "#cc0000",
            },
          }}
        >
          Back
        </Button>
      </Paper>

      {/* Chat Box */}
      <Paper
        elevation={3}
        sx={{
          width: "70%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          p: 2,
          backgroundColor: "#ffffff", // White background
        }}
      >
        {selectedUser ? (
          <>
            <Typography
              variant="h6"
              align="center"
              sx={{
                fontWeight: "bold",
                color: "#ff0000", // Red text
              }}
            >
              Chatting with: {selectedUser}
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Box
              sx={{
                flex: 1,
                overflowY: "auto",
                mb: 2,
                display: "flex",
                flexDirection: "column",
                backgroundColor: "#f9f9f9",
                borderRadius: "10px",
                padding: "10px",
              }}
            >
              {messages
                .filter((msg) => msg.user === selectedUser)
                .map((msg, index) => (
                  <Box
                    key={index}
                    sx={{
                      alignSelf: "flex-start",
                      backgroundColor: "#ffe5e5", // Light red for messages
                      borderRadius: "10px",
                      padding: "8px",
                      marginBottom: "8px",
                      maxWidth: "70%",
                      boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
                    }}
                  >
                    <Typography variant="body2">{msg.text}</Typography>
                  </Box>
                ))}
            </Box>
            <TextField
              fullWidth
              label="Type a message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              sx={{
                mb: 2,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "20px",
                },
              }}
            />
            <Box sx={{ display: "flex", gap: 2 }}>
              <Button
                variant="contained"
                fullWidth
                onClick={handleSendMessage}
                sx={{
                  backgroundColor: "#ff0000", // Red button
                  "&:hover": {
                    backgroundColor: "#cc0000", // Darker red hover
                  },
                }}
              >
                Send
              </Button>
              <Button
                variant="outlined"
                fullWidth
                onClick={handleRecord}
                sx={{
                  borderColor: "#ff0000", // Red border
                  color: "#ff0000", // Red text
                  "&:hover": {
                    borderColor: "#cc0000", // Darker red hover
                    color: "#cc0000",
                  },
                }}
              >
                Record
              </Button>
            </Box>
          </>
        ) : (
          <Typography
            variant="h6"
            align="center"
            sx={{
              mt: 4,
              color: "#757575",
            }}
          >
            Select a user to start chatting
          </Typography>
        )}
      </Paper>
    </Container>
  );
};

export default MessagePage;