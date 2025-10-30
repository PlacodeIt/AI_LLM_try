import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css'; 
import '../styles/layout.css';                 
import CustomButton from '../design/CustomButton'; 
import axios from 'axios';

const LandingPage = () => {
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleCheckSession = async () => {
    try {
      const response = await axios.get('http://localhost:5000/check-session');
      
      if (response.data.redirectToDashboard) {
        navigate('/dashboard');
      } else {
        setMessage(response.data.message);
      }
    } catch (error) {
      console.error('Error checking session:', error);
      setMessage('Error checking session. Please try again.');
    }
  };

  return (
    <div className="full-screen-container">
      <div className="header-section">
        <h1>Welcome to Telegram Data Fetcher</h1>
        <p>Fetch, Store, and Analyze Telegram messages with ease!</p>
      </div>

      <div className="row text-center mt-4" style={{ width: '100%', maxWidth: '800px' }}>
      <div className="col-md-6 mb-3 mb-md-0">
      <div className="custom-card">
      <h3>Why use this app?</h3>
      <p>
        Connect with the Telegram API, fetch data, and store it in MongoDB for easy analysis.
      </p>
    </div>
  </div>
  <div className="col-md-6">
    <div className="custom-card">
      <h3>Simple to Use</h3>
      <p>
        Enter your search terms, fetch the data, and view results instantly!
      </p>
    </div>
  </div>
</div>

      
      <div className="button-container">
        <Link to="/login">
          <CustomButton
            text="Start"
            onClick={() => console.log('Redirecting to login...')}
          />
        </Link>
        <CustomButton
          text="Check Session and Redirect"
          onClick={handleCheckSession}
        />
      </div>

      {message && (
        <div className="alert-message">
          {message}
        </div>
      )}
    </div>
  );
};

export default LandingPage;
