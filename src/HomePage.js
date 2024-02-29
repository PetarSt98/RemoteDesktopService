import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Footer from './Components/Footer';
import './App.css'; // Ensure your CSS file has the new styles
import { useTokenExchangeHandler } from "./shared/useTokenExchangeHandler";
import { Button, OverlayTrigger, Popover, Modal } from 'react-bootstrap';


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

  const popover = (
    <Popover id="popover-basic" style={{maxWidth: '600px'}}>
      <Popover.Header as="h3">Help</Popover.Header>
      <Popover.Body>
        This website manages the list of users/devices and sessions allowed to connect to devices from outside CERN.
        <br/><br/>
        To enable Remote Desktop Access to your devices from outside CERN and download RDP files, use Remote Desktop Gateway.
        <br/><br/> 
        To disconnect your user sessions from Remote Desktop Terminal Services clusters, use Log Me Off.
        <br/><br/> 
        For Administrators: To disconnect users from Remote Desktop Terminal Services clusters you manage, use Log Users Off.
        <br/><br/> 
        To be able to use Manage Gateways, the account CERN\{userName} must be a CERN primary account, and it has to fulfill at least one of the following requirements:
        <br/><br/>
        Is registered as 'Responsible' or 'Main User' of the device. To check or modify this information, visit the network database available at <a href="https://landb.cern.ch/portal" style={{color: 'blue', marginLeft: '4px'}}>https://landb.cern.ch/portal</a>.
        <br/><br/>
        <strong>Service Portal Knowledge Base articles:</strong>
      <ul>
        <li><a href="https://cern.service-now.com/service-portal?id=kb_article&n=KB0006557" style={{ color: 'blue' }}>Connect to the Windows Terminal Servers cluster (cernts)</a></li>
        <li><a href="https://cern.service-now.com/service-portal?id=kb_article&n=KB0004334" style={{ color: 'blue' }}>Configure Remote Desktop to access a Windows PC from outside</a></li>
        <li><a href="https://cern.service-now.com/service-portal?id=kb_article&n=KB0001255" style={{ color: 'blue' }}>Connecting to a Windows Terminal Service at CERN (On Windows, Mac and Linux)</a></li>
        <li><a href="https://cern.service-now.com/service-portal?id=kb_article&n=KB0009026" style={{ color: 'blue' }}>How to use the new Remote Desktop Service website</a></li>
        <li><a href="https://cern.service-now.com/service-portal?id=kb_article&n=KB0008599" style={{ color: 'blue' }}>How to print on Windows Terminal Service (CERNTS)</a></li>
        <li><a href="https://cern.service-now.com/service-portal?id=kb_article&n=KB0004112" style={{ color: 'blue' }}>Enable Remote Desktop Services role</a></li>
        <li><a href="https://cern.service-now.com/service-portal?id=kb_article&n=KB0008336" style={{ color: 'blue' }}>How to run Oracle Java in cernts</a></li>
      </ul>

      </Popover.Body>
    </Popover>
  );

  return (
    <div className="App">
      <div className="headerImage py-5">
        <h1 className="headerTitle text-center">CERN Remote Desktop Service</h1>
      </div>
      <div className="container my-5">
      <div className="d-flex justify-content-center align-items-center mb-3">
          <h1 className="title" style={{ position: 'absolute', marginTop: '0', marginBottom: '0' }}>Welcome to the CERN Remote Desktop Service</h1>
      <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
            <OverlayTrigger trigger="click" placement="left" overlay={popover} rootClose>
              <Button variant="secondary">Help</Button>
            </OverlayTrigger>
          </div>
          </div>
        <div className="row">
          {!isAdmin && (
            <>
              {/* Spacer to center the User Management and Log Me Off */}
              <div className="col-md-2"></div> {/* Adjust this value based on your layout preference */}
              
              <div className="col-md-4 mb-4">
                <div className="card h-100 shadow-sm hover-effect">
                  <div className="card-body d-flex flex-column">
                    <h5 className="card-title">Remote Desktop Gateway</h5>
                    <p className="card-text">Enable Remote Desktop Access to your devices from outside CERN.</p>
                    <Link to="/gateway" className="mt-auto btn btn-primary">Remote Desktop Gateway</Link>
                  </div>
                </div>
              </div>

              {/* Additional spacer to maintain the gap. If not needed, adjust the adjacent column sizes */}
              <div className="col-md-4 mb-4">
                <div className="card h-100 shadow-sm hover-effect">
                  <div className="card-body d-flex flex-column">
                    <h5 className="card-title">Log Me Off</h5>
                    <p className="card-text">Disconnect your user sessions from Remote Desktop Terminal Services clusters.</p>
                    <Link to="/log-me-off" className="mt-auto btn btn-primary">Log Me Off</Link>
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
                    <h5 className="card-title">Remote Desktop Gateway</h5>
                    <p className="card-text">Enable Remote Desktop Access to your devices from outside CERN.</p>
                    <Link to="/gateway" className="mt-auto btn btn-primary">Remote Desktop Gateway</Link>
                  </div>
                </div>
              </div>

              <div className="col-md-4 mb-4">
                <div className="card h-100 shadow-sm hover-effect">
                  <div className="card-body d-flex flex-column">
                    <h5 className="card-title">Log Me Off</h5>
                    <p className="card-text">Disconnect your user sessions from Remote Desktop Terminal Services clusters.</p>
                    <Link to="/log-me-off" className="mt-auto btn btn-primary">Log Me Off</Link>
                  </div>
                </div>
              </div>

              <div className="col-md-4 mb-4">
                <div className="card h-100 shadow-sm hover-effect">
                  <div className="card-body d-flex flex-column">
                    <h5 className="card-title">Log User Off</h5>
                    <p className="card-text">For Administrators. Disconnect users from Remote Desktop Terminal Services clusters you manage.</p>
                    <Link to="/log-user-off" className="mt-auto btn btn-primary">Log Users Off</Link>
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
