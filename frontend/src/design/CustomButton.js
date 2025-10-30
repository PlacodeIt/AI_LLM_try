import React from 'react';
import { Spinner } from 'react-bootstrap';
import theme from '../styles/theme';  

const CustomButton = ({ onClick, text, isLoading, color = 'primary', disabled = false }) => {
  const buttonColor = theme.colors[color] || theme.colors.primary;  

  return (
    <button
      className={`btn`} 
      style={{
        backgroundColor: buttonColor,
        color: theme.colors.light,
        padding: theme.spacing.medium,
        borderRadius: theme.borderRadius.medium  
      }}
      onClick={onClick}
      disabled={isLoading || disabled}  
      aria-label={isLoading ? "Loading..." : text}  
    >
      {isLoading ? <Spinner animation="border" size="sm" /> : text}
    </button>
  );
};

// buttons 4 reuse
export const PrimaryButton = (props) => (
  <CustomButton {...props} color="primary" />
);

export const SecondaryButton = (props) => (
  <CustomButton {...props} color="secondary" />
);

export const SuccessButton = (props) => (
  <CustomButton {...props} color="success" />
);

export const DangerButton = (props) => (
  <CustomButton {...props} color="danger" />
);

export const InfoButton = (props) => (  
  <CustomButton {...props} color="info" />
);

export const TelegramButton = (props) => (
  <CustomButton {...props} color="telegram" />
);

export default CustomButton;
