import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Footer from './Components/Footer';
import './App.css'; // Ensure your CSS file has the new styles
import { useTokenExchangeHandler } from "./shared/useTokenExchangeHandler";

const HomePage = ({ token, userName, primaryAccount }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Add a loading state to indicate the fetching process
  const [exchangeToken, setExchangeToken] = useState("");
  useTokenExchangeHandler(token, setExchangeToken);

  useEffect(() => {
    // Define the function that will fetch the admin status
    const fetchAdminStatus = async () => {
      if (token && userName && exchangeToken.length > 0) { // Ensure both token and userName are defined
        setIsLoading(true); // Begin loading
        try {
          const response = await fetch(`https://rdgateway-backend-test.app.cern.ch/api/devices_tabel/admins?userName=${userName}`, {
            method: "GET",
            headers: {
              Authorization: "Bearer " + exchangeToken
            }
          });
          const data = await response.json();
          setIsAdmin(!data); // Assuming the API returns an object with an isAdmin boolean
        } catch (error) {
          console.error('Error fetching admin status:', error);
        } finally {
          setIsLoading(false); // End loading regardless of the fetch outcome
        }
      } else {
        // If token or userName are not yet available, keep loading state active
        // This condition can be adjusted based on how token and userName are expected to be set
        setIsLoading(true);
      }
    };

    fetchAdminStatus();
  }, [exchangeToken, userName]); // This effect depends on token and userName

  if (isLoading) {
    return (
      <div className="App">
        <div className="headerImage py-5">
          <h1 className="headerTitle text-center">CERN Remote Desktop Service</h1>
        </div>
        <div className="container my-5">
          <p className="lead text-center mb-5">Checking your access privileges...</p>
          {/* Optionally, you can add a spinner or loading animation here */}
        </div>
      </div>
    );
  }
  return (
    <div className="App">
      <div className="headerImage py-5">
        <h1 className="headerTitle text-center">CERN Remote Desktop Service</h1>
      </div>
      <div className="container my-5">
        <p className="lead text-center mb-5">Welcome to the CERN Remote Desktop Service. Select an option below to proceed.</p>
        
        <div className="row">
          {!isAdmin && (
            <>
              {/* Spacer to center the User Management and Log Me Off */}
              <div className="col-md-2"></div> {/* Adjust this value based on your layout preference */}
              
              <div className="col-md-4 mb-4">
                <div className="card h-100 shadow-sm hover-effect">
                  <div className="card-body d-flex flex-column">
                    <h5 className="card-title">Gateways</h5>
                    <p className="card-text">Manage users and their access privileges for remote desktop services.</p>
                    <Link to="/gateway" className="mt-auto btn btn-primary">Manage gateways</Link>
                  </div>
                </div>
              </div>

              {/* Additional spacer to maintain the gap. If not needed, adjust the adjacent column sizes */}
              <div className="col-md-4 mb-4">
                <div className="card h-100 shadow-sm hover-effect">
                  <div className="card-body d-flex flex-column">
                    <h5 className="card-title">Log Me Off</h5>
                    <p className="card-text">Disconnect your sessions from all remote desktop services.</p>
                    <Link to="/log-me-off" className="mt-auto btn btn-primary">Log Off</Link>
                  </div>
                </div>
              </div>

              <div className="col-md-2"></div> {/* Adjust this value based on your layout preference */}
            </>
          )}

          {isAdmin && (
            <>
              <div className="col-md-4 mb-4">
                <div className="card h-100 shadow-sm hover-effect">
                  <div className="card-body d-flex flex-column">
                    <h5 className="card-title">User Management</h5>
                    <p className="card-text">Manage users and their access privileges for remote desktop services.</p>
                    <Link to="/user-management" className="mt-auto btn btn-primary">Manage Users</Link>
                  </div>
                </div>
              </div>

              <div className="col-md-4 mb-4">
                <div className="card h-100 shadow-sm hover-effect">
                  <div className="card-body d-flex flex-column">
                    <h5 className="card-title">Log Me Off</h5>
                    <p className="card-text">Disconnect your sessions from all remote desktop services.</p>
                    <Link to="/log-me-off" className="mt-auto btn btn-primary">Log Off</Link>
                  </div>
                </div>
              </div>

              <div className="col-md-4 mb-4">
                <div className="card h-100 shadow-sm hover-effect">
                  <div className="card-body d-flex flex-column">
                    <h5 className="card-title">Administrate Users</h5>
                    <p className="card-text">Log User Off - Administrate other users' sessions and access.</p>
                    <Link to="/log-user-off" className="mt-auto btn btn-primary">Administrate Users</Link>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};



export default HomePage;
