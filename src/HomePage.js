import React from 'react';
import { Link } from 'react-router-dom';
import Footer from './Components/Footer'; // If Footer is needed individually
import './App.css';

const HomePage = () => {
  return (
    <div className="App">
      <div className="headerImage">
        <h1 className="headerTitle">Welcome to CERN Remote Desktop Service</h1>
      </div>
      <div className="container mt-4">
        <p>Welcome to the home page of CERN's Remote Desktop Service...</p>
        <Link to="/user-management" className="btn btn-primary">Go to User Management</Link>
        <Link to="/log-me-off" className="btn btn-primary">Log Me Off</Link>
        <Link to="/log-user-off" className="btn btn-primary">Log User Off</Link>
      </div>
      <Footer /> {/* Include only if Footer is not in App.js */}
    </div>
  );
};

export default HomePage;
