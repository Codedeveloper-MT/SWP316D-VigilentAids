import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { App } from '@capacitor/app';
import { Toast } from '@capacitor/toast';
//import '../styles/register.css';
import "../styles/logins.css";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: "",
    phone: "",
    country: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/api/register", {
        username: formData.username,
        password: formData.password,
        cell_number: formData.phone,
        country: formData.country,
      });

      if (response.data.success) {
        setMessage("Account created successfully! Please login.");
        setFormData({
          username: "",
          phone: "",
          country: "",
          password: "",
        });
        setTimeout(() => navigate("/login"), 3000);
      }
    } catch (error) {
      setMessage(error.response?.data?.error || "An error occurred during registration.");
    }
  };

  const handleNavigateToLogin = () => {
    navigate("/login");
  };

  return (
    <div className="registration-container">
      <div className="form-container">
        <h2>Create an Account</h2>
        {message && <p className="message">{message}</p>}

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            required
          />
          <input
            type="tel" 
            name="phone"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="country"
            placeholder="Country"
            value={formData.country}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <button type="submit">Register</button>
          <button
            type="button"
            onClick={handleNavigateToLogin}
            className="register-btn"
          >
            Back to login
          </button>
        </form>
      </div>
    </div>
  );
}

export default RegisterPage;
