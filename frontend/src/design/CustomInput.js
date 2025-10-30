import React from 'react';
import { Form } from 'react-bootstrap';

const CustomInput = ({ label, value, onChange, type = 'text', placeholder = '', required = false }) => {
  return (
    <Form.Group controlId={label}>
      {label && <Form.Label>{label}</Form.Label>}
      <Form.Control
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        style={{
          backgroundColor: 'var(--theme-text-color)', 
          color: 'var(--theme-dark-color)',             
          border: '1px solid var(--theme-secondary-color)',  
          borderRadius: 'var(--theme-border-radius-small)', 
          padding: 'var(--theme-spacing-small)',   
          boxSizing: 'border-box',   
        }}
      />
    </Form.Group>
  );
};

export default CustomInput;
