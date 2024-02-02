import React from 'react';
import { Link } from 'react-router-dom';
import Footer from './Components/Footer';
import './App.css'; // Ensure your CSS file has the new styles

const HomePage = ( token, userName, primaryAccount ) => {
  return (
    <div className="App">
      <div className="headerImage py-5">
        <h1 className="headerTitle text-center">CERN Remote Desktop Service</h1>
      </div>
      <div className="container my-5">
        <p className="lead text-center mb-5">Welcome to the CERN Remote Desktop Service. Select an option below to proceed.</p>
        
        <div className="row">
          <div className="col-md-4 mb-4">
            <div className="card h-100 shadow-sm hover-effect">
              <div className="card-body d-flex flex-column">
                <h5 className="card-title">User Management</h5>
                <p className="card-text">Manage users and their access privileges for remote desktop services.</p>
                <Link to="/user-management" className="btn btn-primary mt-auto">Manage Users</Link>
              </div>
            </div>
          </div>

          <div className="col-md-4 mb-4">
            <div className="card h-100 shadow-sm hover-effect">
              <div className="card-body d-flex flex-column">
                <h5 className="card-title">Log Me Off</h5>
                <p className="card-text">Disconnect your sessions from all remote desktop services.</p>
                <Link to="/log-me-off" className="btn btn-primary mt-auto">Log Off</Link>
              </div>
            </div>
          </div>

          <div className="col-md-4 mb-4">
            <div className="card h-100 shadow-sm hover-effect">
              <div className="card-body d-flex flex-column">
                <h5 className="card-title">Log User Off</h5>
                <p className="card-text">Administrate other users' sessions and access.</p>
                <Link to="/log-user-off" className="btn btn-primary mt-auto">Administrate Users</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default HomePage;
