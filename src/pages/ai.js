import Vapi from "@vapi-ai/web";

export const vapi = new Vapi(import.meta.env.VITE_VAPI_API_KEY);
const assistantId = import.meta.env.VITE_ASSISTANT_ID;

// Start the assistant
export const startAssistant = async () => {
  try {
    const session = await vapi.start(assistantId);
    console.log("Assistant started:", session);
    return session;
  } catch (error) {
    console.error("Error starting assistant:", error);
    throw error;
  }
};

// Stop the assistant
export const stopAssistant = () => {
  try {
    vapi.stop();
    console.log("Assistant stopped");
  } catch (error) {
    console.error("Error stopping assistant:", error);
    throw error;
  }
};

// Get current voice configuration
export const getVoiceConfig = async () => {
  try {
    const config = await vapi.getConfig();
    return config?.voice || { speed: 1.0 };
  } catch (error) {
    console.error("Error getting voice config:", error);
    return { speed: 1.0 };
  }
};

// Update voice speed
export const updateVoiceSpeed = async (speed) => {
  try {
    await vapi.setConfig({
      voice: { speed }
    });
    console.log("Voice speed updated to:", speed);
  } catch (error) {
    console.error("Error updating voice speed:", error);
    throw error;
  }
};

// Set up event listeners
export const setupEventListeners = (handlers) => {
  Object.entries(handlers).forEach(([event, handler]) => {
    vapi.on(event, handler);
  });
  
  return () => {
    Object.keys(handlers).forEach(event => {
      vapi.off(event);
    });
  };
};