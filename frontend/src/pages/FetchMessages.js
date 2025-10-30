import React, { useState } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Spinner, Form} from 'react-bootstrap';
import CustomButton from '../design/CustomButton';  
import AlertMessage from '../design/AlertMessage';  
import CustomInput from '../design/CustomInput';  
import TableChannels from '../design/TableChannels';  
import ModelResult from './ModelResult';
import { useNavigate } from 'react-router-dom';


const FetchMessages = () => {
  const [channelSearchTerm, setChannelSearchTerm] = useState('');
  const [messageSearchTerm, setMessageSearchTerm] = useState('');
  const [messageLimit, setMessageLimit] = useState(50);
  const [alert, setAlert] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(false);  
  const [modelResults, setModelResults] = useState([]);
  const navigate = useNavigate();
  const [fetchedMessages, setFetchedMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const initialShowColumns = {
    message_id: true,
    chat_name: true,
    message_text: true,
    user_id: false,
    chat_id: false,
    date: false,
    fetch_time: false
  };

  const collectionName = "fetch_data";

  const handleFetch = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setAlert(null);

    try {
      const response = await axios.post('http://localhost:5000/api/fetch-messages', {
        user_channel_word: channelSearchTerm,
        user_msg_word: messageSearchTerm,
        message_limit: messageLimit
      });

      console.log('Backend Response:', response.data);

      setAlert({
        message: `Messages fetched successfully!`,
        type: 'success'
      });

      fetchMessagesFromDB();
    } catch (error) {
      setAlert({ message: 'Failed to fetch messages. Please try again.', type: 'danger' });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessagesFromDB = async () => {
    setLoadingMessages(true);
    console.log('Fetching messages from collection:', collectionName);

    try {
      const response = await axios.get('http://localhost:5000/api/channels');
      console.log('Response from backend:', response.data);

      if (response.data.length > 0) {
        setFetchedMessages(response.data);
        console.log('Updated fetchedMessages state:', response.data);
      } else {
        setFetchedMessages([]);
        console.warn('No messages found in the collection');
      }
    } catch (error) {
      console.error('Error fetching data from MongoDB:', error);
      setAlert({ message: 'Failed to load messages from the database.', type: 'danger' });
    } finally {
      setLoadingMessages(false);
    }
  };


  const handleRunModel = async () => {
    setIsModelLoading(true);
    try {
        const response = await axios.post('http://localhost:5000/api/run-model');
        setModelResults(response.data.results);
        setAlert({ message: 'Model ran successfully!', type: 'success' });

        // ניווט לדף התוצאות
        navigate('/model-result', { state: { results: response.data.results } });
    } catch (error) {
        setAlert({ message: 'Failed to run model. Please try again.', type: 'danger' });
    } finally {
        setIsModelLoading(false);
    }
  };

  



  return (
    <div className="fetch-page-container">
      {/* Search Section */}
      <div className="search-section">
        <Container>
          <Row className="justify-content-center">
            <Col md={10} lg={8}>
              {alert && (
                <AlertMessage
                  message={alert.message}
                  type={alert.type}
                  dismissible={true}
                  onDismiss={() => setAlert(null)}
                />
              )}
              
              {/* Input Fields Card */}
              <Card className="search-card">
                <Card.Body>
                  <Form>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Channel Search Term:</Form.Label>
                          <Form.Control
                            type="text"
                            value={channelSearchTerm}
                            onChange={(e) => setChannelSearchTerm(e.target.value)}
                            placeholder="Enter channel search term"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Message Search Term:</Form.Label>
                          <Form.Control
                            type="text"
                            value={messageSearchTerm}
                            onChange={(e) => setMessageSearchTerm(e.target.value)}
                            placeholder="Enter message search term"
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row>
                      <Col md={12}>
                        <Form.Group className="mb-3">
                          <Form.Label>Message Limit (50-1800):</Form.Label>
                          <Form.Control
                            type="number"
                            value={messageLimit}
                            onChange={(e) => setMessageLimit(e.target.value)}
                            min="50"
                            max="1800"
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  </Form>
                </Card.Body>
              </Card>

              {/* Action Buttons */}
              <div className="d-flex justify-content-center gap-3 my-4">
                <CustomButton
                  onClick={handleFetch}
                  text="Fetch Messages"
                  isLoading={isLoading}
                  color="primary"
                />
                <CustomButton
                  onClick={fetchMessagesFromDB}
                  text="Refresh Table"
                  color="info"
                />
                <CustomButton
                  onClick={handleRunModel}
                  text={isModelLoading ? 'Running...' : 'Run Model'}
                  isLoading={isModelLoading}
                  color="warning"
                />
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Table Section */}
      <div className="messages-table-section">
        <Container>
          {loadingMessages ? (
            <div className="text-center mt-4">
              <Spinner animation="border" />
              <p>Loading messages...</p>
            </div>
          ) : (
            <Row className="justify-content-center">
              <Col>
                <TableChannels 
                  channels={fetchedMessages} 
                  initialShowColumns={initialShowColumns} 
                />
              </Col>
            </Row>
          )}
          {modelResults.length > 0 && <ModelResult results={modelResults} />}
        </Container>
      </div>
    </div>
  );
};

export default FetchMessages;