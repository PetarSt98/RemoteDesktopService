import React, { useState, useEffect } from 'react';
import AuthRibbon from './AuthRibbon';
import Footer from './Footer';
import '../App.css';
import { useTokenExchangeHandler } from "../shared/useTokenExchangeHandler";
import { CircularProgress } from '@material-ui/core'; // Import a loading component
import Switch from '@material-ui/core/Switch'; // Import a Switch component for the toggle button

const LogMeOff = ({ token, userName, primaryAccount }) => {
  const [devices, setDevices] = useState([]);
  const [exchangeToken, setExchangeToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [percentage, setPercentage] = useState(0);
  const [fetchOnlyPublicCluster, setFetchOnlyPublicCluster] = useState("true");
  const [waitTime, setWaitTime] = useState(30000); // Default to 30 seconds

  useTokenExchangeHandler(token, setExchangeToken);

  useEffect(() => {
    if (exchangeToken.length > 0) {
      setLoading(true);
      setPercentage(0);
      const startTime = Date.now();

      const updatePercentage = () => {
        const elapsedTime = Date.now() - startTime;
        const percentage = Math.min(100, (elapsedTime / waitTime) * 100);
        setPercentage(percentage);
        if (percentage < 100) {
          requestAnimationFrame(updatePercentage);
        }
      };

      fetch(`https://rdgateway-backend-test.app.cern.ch/api/log_session/trigger?username=${userName}&fetchOnlyPublicCluster=${fetchOnlyPublicCluster}`, {
          method: "GET",
          headers: {
              Authorization: "Bearer " + exchangeToken
          }
      })
      .then(response => {
          if (response.ok) {
              console.log("Session data generation process started.");
              setTimeout(() => {
                fetchResult();
                setLoading(false);
              }, waitTime);
              requestAnimationFrame(updatePercentage);
          } else {
              throw new Error('Failed to start session data generation process');
          }
      })
      .catch(error => {
        console.error('Error starting session data generation process:', error);
        setLoading(false);
        setPercentage(0);
      });
    }
  }, [userName, exchangeToken, fetchOnlyPublicCluster, waitTime]);

  const fetchResult = () => {
    fetch(`https://rdgateway-backend-test.app.cern.ch/api/log_session/result?username=${userName}&fetchOnlyPublicCluster=${fetchOnlyPublicCluster}`, {
        method: "GET",
        headers: {
            Authorization: "Bearer " + exchangeToken
        }
    })
    .then(response => response.ok ? response.json() : Promise.reject('Failed to fetch'))
    .then(data => {
      // Filter out devices that are not connected
      const filteredDevices = data.filter(device => device.IsConnected === "True").map(device => ({
        name: device.ClusterName,
        serverName: device.serverName,
        machineName: device.MachineName // Include the MachineName in the device object
      }));
      setDevices(filteredDevices);
      setLoading(false);
    })
    .catch(error => {
      console.error('Error fetching devices:', error);
      setLoading(false);
    });
  };

  const handleToggle = (event) => {
    setFetchOnlyPublicCluster(event.target.checked ? "false" : "true");
    setWaitTime(event.target.checked ? 240000 : 30000);
  };

  const handleLogOff = (serverName) => {
    // Handling log off without affecting loading state, assuming it's a quick action
    // Add loading state manipulation here if necessary
  };

  return (
    <div className="App">
      <div className="headerImage">
        <h1 className="headerTitle">CERN Remote Desktop Service</h1>
      </div>
      <div className="container mt-4">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <label>{fetchOnlyPublicCluster === "true" ? 'Fetch Only Public Cluster: ON' : 'Fetch Only Public Cluster: OFF'}</label>
          <Switch checked={fetchOnlyPublicCluster === "false"} onChange={handleToggle} color="primary" />
        </div>
        {loading ? (
          <div className="loading-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', height: '100vh' }}>
            <div>Please wait...</div>
            <div style={{ marginTop: '20px' }}>{Math.round(percentage)}%</div>
          </div>
        ) : (
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Device</th>
                  <th>Machine Name</th> {/* Add this header */}
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {devices.map((device, index) => (
                  <tr key={index}>
                    <td>{device.name}</td>
                    <td>{device.machineName}</td> {/* Display the MachineName */}
                    <td>
                      <button 
                        className="btn btn-outline-primary" 
                        onClick={() => handleLogOff(device.serverName)}
                      >
                        Log Off
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
        )}
      </div>
      <Footer />
    </div>
  );
};
export default LogMeOff;
