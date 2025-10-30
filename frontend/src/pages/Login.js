import React, { useState } from 'react';
import axios from 'axios';
import { Form, Container, Row, Col } from 'react-bootstrap';
import CustomButton, { TelegramButton } from '../design/CustomButton';
import AlertMessage from '../design/AlertMessage';
import StepProgress from '../design/StepProgress'; 
import '../styles/layout.css'; 

const Login = () => {
  const [apiId, setApiId] = useState('');
  const [apiHash, setApiHash] = useState('');
  const [phone, setPhone] = useState('');
  const [login_code, setLoginCode] = useState('');
  const [phone_code_hash, setPhoneCodeHash] = useState('');  
  const [step, setStep] = useState(1);  
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

 
  const handleDismissAlert = () => {
    setMessage('');
  };

  // step 1: Handle API ID and API Hash
  const handleApiSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      await axios.post('http://localhost:5000/login', {
        step: 'login',
        TELEGRAM_API_ID: apiId,
        TELEGRAM_API_HASH: apiHash,
      });
      setMessage('User API credentials accepted.');
      setStep(2);  // next step - step 2 - phone number
      console.log(`[Login] Moving to Step 2`);
    } catch (error) {
      setMessage('Failed to start the login process. Please check your API ID and Hash.');
    } finally {
      setIsLoading(false);
    }
  };

  // step 2: handle phone number 
  const handlePhoneSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/login', {
        step: 'phone',
        TELEGRAM_API_ID: apiId,
        TELEGRAM_API_HASH: apiHash,
        phoneNumber: phone,
      });
      console.log(`[Login] Response from backend: `, response.data);

      const { message, phone_code_hash } = response.data;
      setMessage(message);

      if (phone_code_hash) {
        setPhoneCodeHash(phone_code_hash);  //save phone_code_hash for the next step - important
        setStep(3);  // next step - step 3 - login code input
        console.log(`[Login] Moving to Step 3 with phone_code_hash: ${phone_code_hash}`);
      } else {
        setMessage('Failed to capture phone code hash. Please try again.');
      }
    } catch (error) {
      console.error('[Login] Error:', error);
      if (error.response) {
        console.error('Error Details:', error.response.data);
        setMessage(`Server error: ${error.response.data.details || 'Failed to send phone number'}`);
      } else {
        setMessage('Failed to send phone number. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // step 3: handle login code 
  const handleCodeSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      await axios.post('http://localhost:5000/login', {
        step: 'code',
        TELEGRAM_API_ID: apiId,
        TELEGRAM_API_HASH: apiHash,
        phoneNumber: phone,
        login_code,  // sent to telegram messages
        phone_code_hash,  // must pass login code with phone code hash
      });
      setMessage('Successfully logged in. Redirecting to the dashboard...');
      window.location.href = "/dashboard";  // to dashboard 
    } catch (error) {
      setMessage('Failed to log in. Please check your login code.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container className="full-screen-container">
      <Row className="justify-content-center">
        <Col md={6} className="custom-card">
          <h1 className="text-center mb-4" style={{ color: 'var(--theme-text-color)' }}>Telegram Login</h1>
          <StepProgress currentStep={step} totalSteps={3} />
          {message && <AlertMessage message={message} type="info" dismissible={true} onDismiss={handleDismissAlert} />}
          {/* step 1*/}
          {step === 1 && (
            <Form onSubmit={handleApiSubmit}>
              <Form.Group controlId="apiId">
                <Form.Label style={{ color: 'var(--theme-text-color)' }}>API ID:</Form.Label>
                <Form.Control
                  type="text"
                  value={apiId}
                  onChange={(e) => setApiId(e.target.value)}
                  required
                  style={{ backgroundColor: 'var(--theme-dark-color)', color: 'var(--theme-light-color)' }}
                />
              </Form.Group>

              <Form.Group controlId="apiHash" className="mt-3">
                <Form.Label style={{ color: 'var(--theme-text-color)' }}>API Hash:</Form.Label>
                <Form.Control
                  type="text"
                  value={apiHash}
                  onChange={(e) => setApiHash(e.target.value)}
                  required
                  style={{ backgroundColor: 'var(--theme-dark-color)', color: 'var(--theme-light-color)' }}
                />
              </Form.Group>

              <div className="button-container mt-4">
                <TelegramButton
                  onClick={handleApiSubmit}
                  text="Submit API ID and Hash"
                  isLoading={isLoading}
                />
              </div>
            </Form>
          )}

          {/* step 2*/}
          {step === 2 && (
            <Form onSubmit={handlePhoneSubmit}>
              <Form.Group controlId="phoneNumber">
                <Form.Label style={{ color: 'var(--theme-text-color)' }}>Enter your phone number with country code (+123...):</Form.Label>
                <Form.Control
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  style={{ backgroundColor: 'var(--theme-dark-color)', color: 'var(--theme-light-color)' }}
                />
              </Form.Group>

              <div className="button-container mt-4">
                <TelegramButton
                  onClick={handlePhoneSubmit}
                  text="Submit Phone Number"
                  isLoading={isLoading}
                />
              </div>
            </Form>
          )}

          {/* step 3*/}
          {step === 3 && (
            <Form onSubmit={handleCodeSubmit}>
              <Form.Group controlId="loginCode">
               <Form.Label style={{ color: 'var(--theme-text-color)' }}>Enter the login code sent to your Telegram app:</Form.Label>
                <Form.Control
                 type="text"
                 value={login_code}
                 onChange={(e) => setLoginCode(e.target.value)}
                 required
                 style={{ backgroundColor: 'var(--theme-dark-color)', color: 'var(--theme-light-color)' }}
               />
             </Form.Group>

             <div className="button-container mt-4">
               <TelegramButton
                 onClick={handleCodeSubmit}
                 text="Submit Login Code"
                 isLoading={isLoading}
               />
             </div>
           </Form>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
