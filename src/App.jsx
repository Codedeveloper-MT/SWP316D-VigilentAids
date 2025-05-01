import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import LoginPage from "./pages/LoginPage";
import RegiterPage from "./pages/RegiterPage";
import PasswordPage from "./pages/PasswordPage";
import ScreenPage from "./pages/ScreenPage";
import LocationScreen from "./pages/LocationScreen";
import RouteScreen from "./pages/RouteScreen";
import VeeScreen from "./pages/veeScreen";
import SettingAccount from "./pages/SettingAccount";
import UserUpdate from "./pages/UserUpdate";
import MessagePage from "./pages/MessagePage";
import CameraPage from "./pages/CameraPages"; 

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registerPage" element={<RegiterPage />} />
        <Route path="/passwordPage" element={<PasswordPage />} />
        <Route path="/screenPage" element={<ScreenPage />} />
        <Route path="/location" element={<LocationScreen />} />
        <Route path="/routes" element={<RouteScreen />} />
        <Route path="/vee" element={<VeeScreen />} />
        <Route path="/settings" element={<SettingAccount />} />
        <Route path="/update" element={<UserUpdate />} />
        <Route path="/messages" element={<MessagePage />} />
        <Route path="/camera" element={<CameraPage />} />
      </Routes>
    </Router>
  );
}

export default App;