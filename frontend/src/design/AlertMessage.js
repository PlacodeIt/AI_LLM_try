import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const AlertMessage = ({ message, type = 'info', dismissible = true, onDismiss }) => {
  if (!message) return null; 

  return (
    <div className={`alert alert-${type} ${dismissible ? 'alert-dismissible fade show' : ''}`} role="alert">
      {message}
      {dismissible && (
        <button 
          type="button" 
          className="btn-close" 
          data-bs-dismiss="alert" 
          aria-label="Close" 
          onClick={onDismiss}
        ></button>
      )}
    </div>
  );
};

export default AlertMessage;
