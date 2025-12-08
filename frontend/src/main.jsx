import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Import the CSS file for styling
import App from './App'; // Import your main App component

// Get the root element from the public/index.html file
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render the App component
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);