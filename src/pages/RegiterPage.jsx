import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { App } from '@capacitor/app';
import { Toast } from '@capacitor/toast';
import '../styles/register.css';
//import "../styles/logins.css";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    country: '',
    phone: '',
    password: ''
  });
  const [message, setMessage] = useState('');
  const [isAssistantActive, setIsAssistantActive] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const navigate = useNavigate();

  const speak = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    speak('Registration page. Please fill in your details to create an account.');
    const backButtonHandler = App.addListener('backButton', ({ canGoBack }) => {
      if (!canGoBack) handleNavigateToLogin();
    });
    return () => {
      window.speechSynthesis.cancel();
      backButtonHandler.remove();
    };
  }, []);

  useEffect(() => {
    if (formData.password) {
      let strength = 0;
      if (formData.password.length >= 5) strength++;
      if (/[A-Z]/.test(formData.password)) strength++;
      if (/[0-9]/.test(formData.password)) strength++;
      if (/[^A-Za-z0-9]/.test(formData.password)) strength++;
      setPasswordStrength(strength);
    } else {
      setPasswordStrength(0);
    }
  }, [formData.password]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const toggleAssistant = () => {
    isAssistantActive ? speak('Assistant turned off') : speak('Assistant is ready to help with registration.');
    setIsAssistantActive(!isAssistantActive);
  };

  const validateForm = () => {
    if (!formData.fullName || formData.fullName.length < 3) return 'Full name must be at least 3 characters';
    if (!/^[0-9]{10,15}$/.test(formData.phone)) return 'Enter a valid phone number (10-15 digits)';
    if (passwordStrength < 3) return 'Password too weak. Use uppercase, numbers, and symbols';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const error = validateForm();
    if (error) {
      setMessage(error);
      speak(error);
      setShowAlert(true);
      return;
    }

    setIsLoading(true);
    try {
      await new Promise(res => setTimeout(res, 1500));
      setMessage('Account created successfully! Redirecting to login...');
      speak('Account created successfully! Redirecting to login...');
      await Toast.show({ text: 'Registration successful!', duration: 'long' });
      setFormData({ fullName: '', country: '', phone: '', password: '' });
      setTimeout(() => {
        window.speechSynthesis.cancel();
        navigate('/login');
      }, 3000);
    } catch {
      const errorMsg = 'Registration failed. Please try again.';
      setMessage(errorMsg);
      speak(errorMsg);
      setShowAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigateToLogin = () => {
    speak('Returning to login page');
    window.speechSynthesis.cancel();
    navigate('/login');
  };

  const speakFieldInstructions = (field) => {
    let instruction = `Please enter your ${field}`;
    if (field === 'password') instruction += ' with uppercase, numbers, and special characters.';
    if (field === 'phone') instruction += ' with 10 to 15 digits.';
    if (field === 'full name') instruction += ' (first and last name).';
    speak(instruction);
  };

  const getPasswordStrengthText = () => {
    return ['Very Weak', 'Weak', 'Moderate', 'Strong', 'Very Strong'][passwordStrength];
  };

  return (
    
      <div className="form-container">
        <h2>Create an Account</h2>

        {isLoading && <div className="loading">Creating account...</div>}
        {showAlert && <div className="alert">{message}</div>}

        <form onSubmit={handleSubmit}>
          
            <input
              type="text"
              name="fullName"
              placeholder="Username"
              value={formData.fullName}
              onChange={handleChange}
              onFocus={() => speakFieldInstructions('User Name')}
              required
            />
         

            <input
              type="text"
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleChange}
              onFocus={() => speakFieldInstructions('phone')}
              required
            />

         
            <input
              type="text"
              name="country"
               placeholder="Country"
              value={formData.country}
              onChange={handleChange}
              onFocus={() => speakFieldInstructions('country')}
            />
     
            <input
              type="password"
              name="password"
               placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              onFocus={() => speakFieldInstructions('password')}
              required
            />
          

          {formData.password && (
            <div className="password-strength">
              <span>Password Strength: {getPasswordStrengthText()}</span>
              <div className="strength-meter">
                {[1, 2, 3, 4].map(level => (
                  <div
                    key={level}
                    className={`bar ${passwordStrength >= level ? 'filled' : ''}`}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="button-group">
            <button type="submit" className="btn-register">Register</button>
            <button type="button" onClick={toggleAssistant} className="btn-assistant">
              {isAssistantActive ? 'Stop Assistant' : 'Start Assistant'}
            </button>
            <button type="button" onClick={handleNavigateToLogin} className="btn-login">Back to Login</button>
          </div>
        </form>
      </div>
    
  );
};

export default RegisterPage;
