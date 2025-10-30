import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomButton, { TelegramButton } from '../design/CustomButton'; 
import AlertMessage from '../design/AlertMessage'; 
import 'bootstrap/dist/css/bootstrap.min.css'; 
import '../styles/layout.css'; 

const Dashboard = () => {
  const navigate = useNavigate();
  const [showAlert, setShowAlert] = useState(true);

  const handleFetchMessages = () => {
    navigate('/fetch'); 
  };

  return (
    <div className="container py-5">
      {showAlert && (
        <AlertMessage
          message={(
            <>
              Session successfully created!<br />
              You can now proceed to explore additional features.
            </>
          )}
          type="success"
          dismissible={true}
          onDismiss={() => setShowAlert(false)} // Properly passing onDismiss handler
        />
      )}

      
      <div className="row justify-content-center">
        <div className="col-md-6 mb-4">
          <div className="custom-card text-center p-4">
            <h3 style={{ color: 'var(--theme-text-color)' }}>Fetch Messages</h3>
            <p style={{ color: 'var(--theme-text-color)' }}>
              Connect to Telegram, extract messages from your channels, and analyze them.
            </p>
            <div className="button-container mt-3">
              <TelegramButton
                onClick={handleFetchMessages}
                text="Fetch Messages"
              />
            </div>
          </div>
        </div>

        <div className="col-md-6 mb-4">
          <div className="custom-card text-center p-4">
            <h3 style={{ color: 'var(--theme-text-color)' }}>Other Features</h3>
            <p style={{ color: 'var(--theme-text-color)' }}>
              Explore other capabilities we are planning to add in the future.
            </p>
            <div className="button-container mt-3">
              <CustomButton
                onClick={() => alert('Coming soon!')}
                text="Explore Features"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
