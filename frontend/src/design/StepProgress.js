import React from 'react';
import '../styles/stepProgress.css'; 

const StepProgress = ({ currentStep, totalSteps }) => {
  return (
    <div className="step-progress-container">
      {[...Array(totalSteps)].map((_, index) => {
        const stepNumber = index + 1;
        const isCompleted = stepNumber < currentStep;  
        const isCurrent = stepNumber === currentStep;  
        
        return (
          <div key={index} className={`step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}>
            <div className="step-number">{stepNumber}</div>
            {stepNumber < totalSteps && <div className={`step-bar ${isCompleted ? 'completed' : ''}`}></div>}
          </div>
        );
      })}
    </div>
  );
};

export default StepProgress;
