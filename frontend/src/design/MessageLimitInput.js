import React from 'react';
import { Form } from 'react-bootstrap';

const MessageLimitInput = ({ value, onChange }) => {
  return (
    <Form.Group controlId="messageLimit" className="mt-3">
      <Form.Label>Enter the Total Number of Messages to Fetch (Default 50, Max 1800):</Form.Label>
      <Form.Control
        type="number"
        value={value}
        onChange={onChange}
        min="50"
        max="1800"
        required
      />
    </Form.Group>
  );
};

export default MessageLimitInput;
