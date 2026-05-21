import { useState, useEffect } from 'react';
import { getAPIStatus, checkBackendHealth } from '../services/api';
import './ConnectionStatus.css';

export default function ConnectionStatus() {
  const [status, setStatus] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateStatus = () => {
      const apiStatus = getAPIStatus();
      setStatus(apiStatus);
      
      // Only show if backend is unavailable
      setIsVisible(!apiStatus.backendAvailable);
    };

    // Initial check
    updateStatus();

    // Check every 10 seconds
    const interval = setInterval(updateStatus, 10000);

    return () => clearInterval(interval);
  }, []);

  if (!isVisible || !status) {
    return null;
  }

  const handleRetry = async () => {
    const available = await checkBackendHealth();
    if (available) {
      setIsVisible(false);
    }
  };

  return (
    <div className="connection-status connection-status--error">
      <div className="connection-status__content">
        <div className="connection-status__icon">⚠️</div>
        <div className="connection-status__message">
          <strong>Backend Disconnected</strong>
          <p>Please ensure the backend server is running. Use: <code>npm run dev</code></p>
        </div>
        <button 
          onClick={handleRetry}
          className="connection-status__retry"
        >
          Retry
        </button>
      </div>
    </div>
  );
}
