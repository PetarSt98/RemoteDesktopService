import React, { useState, useEffect } from 'react';
import AuthRibbon from './AuthRibbon';
import Swal from 'sweetalert2';
import Footer from './Footer';
import '../App.css';
import { useTokenExchangeHandler } from "../shared/useTokenExchangeHandler";
import { CircularProgress } from '@material-ui/core'; // Import a loading component
import Switch from '@material-ui/core/Switch'; // Import a Switch component for the toggle button
import { Typography, FormControlLabel, Box } from '@material-ui/core';


const LogMeOff = ({ token, userName, primaryAccount }) => {
  const [devices, setDevices] = useState([]);
  const [exchangeToken, setExchangeToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [percentage, setPercentage] = useState(0);
  const [fetchOnlyPublicCluster, setFetchOnlyPublicCluster] = useState("true");
  const [waitTime, setWaitTime] = useState(30000); // Default to 30 seconds
  const [logOffTrigger, setLogOffTrigger] = useState(0);
  const [clusterSearchText, setClusterSearchText] = useState(''); // State for cluster search text
  const [machineSearchText, setMachineSearchText] = useState('');
  const [loggingOffDevice, setLoggingOffDevice] = useState(null);


  useTokenExchangeHandler(token, setExchangeToken);

  useEffect(() => {
    let abortController = new AbortController(); // Create a new instance of AbortController
    const signal = abortController.signal; // Get the signal to pass to fetch calls

    const fetchData = async () => {
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

        try {
          const response = await fetch(`https://rdgateway-backend-test.app.cern.ch/api/log_session/trigger?username=${userName}&fetchOnlyPublicCluster=${fetchOnlyPublicCluster}`, {
            method: "GET",
            headers: {
              Authorization: "Bearer " + exchangeToken
            },
            signal: signal // Pass the signal to the fetch call
          });

          if (!response.ok) throw new Error('Failed to start session data generation process');

          console.log("Session data generation process started.");
          setTimeout(async () => {
            if (!abortController.signal.aborted) { // Check if the request has been aborted
              await fetchResult();
              setLoading(false);
            }
          }, waitTime);

          requestAnimationFrame(updatePercentage);
        } catch (error) {
          if (error.name !== 'AbortError') { // Ignore abort errors
            console.error('Error starting session data generation process:', error);
            setLoading(false);
            setPercentage(0);
          }
        }
      }
    };

    fetchData();

    return () => {
      abortController.abort(); // Abort any ongoing fetches when the component unmounts or the effect re-runs
    };
  }, [userName, exchangeToken, fetchOnlyPublicCluster, waitTime, logOffTrigger]);
  
  const fetchResult = () => {
    fetch(`https://rdgateway-backend-test.app.cern.ch/api/log_session/result?username=${userName}&fetchOnlyPublicCluster=${fetchOnlyPublicCluster}`, {
      method: "GET",
      headers: {
        Authorization: "Bearer " + exchangeToken
      }
    })
    .then(response => {
      if (!response.ok) {
        // Handle non-OK responses from the server
        throw new Error('Failed to fetch');
      }
      return response.json();
    })
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
      // Use SweetAlert2 to show the error message
      Swal.fire({
        icon: 'error',
        title: 'Server is busy',
        text: 'Please refresh the page.',
        confirmButtonText: 'Refresh',
        preConfirm: () => {
          window.location.reload(); // Refresh the page when the user clicks "Refresh"
        }
      });
    });
  };
  

  const handleClusterSearchChange = (event) => {
    setClusterSearchText(event.target.value);
  };

  const handleMachineSearchChange = (event) => {
    setMachineSearchText(event.target.value);
  };


  const handleToggle = (event) => {
    setFetchOnlyPublicCluster(event.target.checked ? "false" : "true");
    setWaitTime(event.target.checked ? 150000 : 30000);
  };

  const handleLogOff = (userName, machineName) => {
    setLoggingOffDevice(machineName);
    fetch(`https://rdgateway-backend-test.app.cern.ch/api/log_session/log-off?username=${userName}&servername=${machineName}`, {
      method: "DELETE", // Use DELETE method for log-off operation
      headers: {
        Authorization: `Bearer ${exchangeToken}`, // Use the exchange token for authorization
        'Content-Type': 'application/json', // Specify the content type
      },
    })
    .then(response => {
      if (response.ok) {
        console.log("Log-off successful for:", machineName);
        setLogOffTrigger(prev => prev + 1);
      } else {
        throw new Error('Failed to log off');
      }
    })
    .catch(error => {
      console.error('Error during log-off:', error);
    })
    .finally(() => {
      setLoggingOffDevice(null); // Reset the logging off state
    });
  };

  const filteredDevices = devices.filter(device => {
    if (clusterSearchText && machineSearchText) {
      return device.name.toLowerCase().includes(clusterSearchText.toLowerCase()) && device.machineName.toLowerCase().includes(machineSearchText.toLowerCase());
    } else if (clusterSearchText) {
      return device.name.toLowerCase().includes(clusterSearchText.toLowerCase());
    } else if (machineSearchText) {
      return device.machineName.toLowerCase().includes(machineSearchText.toLowerCase());
    }
    return true;
  });
  
  return (
    <div className="App">
      <div className="headerImage">
        <h1 className="headerTitle">CERN Remote Desktop Service</h1>
      </div>
      <div className="container mt-4">
      <div style={{ display: 'flex', justifyContent: 'start', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap' }}>
          {/* Cluster Name Search Bar */}
          <div style={{ flex: 1, marginRight: '10px', display: 'flex', alignItems: 'center', background: '#f0f0f0', borderRadius: '20px', padding: '5px 15px', maxWidth: '400px' }}>
            <i className="fas fa-search" style={{ marginRight: '10px' }}></i>
            <input
              type="text"
              placeholder="Search cluster names"
              value={clusterSearchText}
              onChange={handleClusterSearchChange}
              style={{ border: 'none', outline: 'none', background: 'transparent', flex: 1 }}
            />
          </div>
          {/* Machine Name Search Bar */}
          <div style={{ flex: 1, marginRight: '20px', display: 'flex', alignItems: 'center', background: '#f0f0f0', borderRadius: '20px', padding: '5px 15px', maxWidth: '400px' }}>
            <i className="fas fa-search" style={{ marginRight: '10px' }}></i>
            <input
              type="text"
              placeholder="Search machine names"
              value={machineSearchText}
              onChange={handleMachineSearchChange}
              style={{ border: 'none', outline: 'none', background: 'transparent', flex: 1 }}
            />
          </div>
          {/* <Box style={{ margin: '20px 0' }}>
  <Typography variant="body1" style={{ marginBottom: '10px', color: '#333' }}>
    {fetchOnlyPublicCluster === "true" ? 'Currently Viewing: Public Clusters Only' : 'Currently Viewing: All Clusters'}
  </Typography>
  <FormControlLabel
    control={
      <Switch
        checked={fetchOnlyPublicCluster === "false"}
        onChange={handleToggle}
        name="publicClusterSwitch"
        color="primary"
      />
    }
    label="Show All Clusters"
    style={{ margin: '10px 0' }}
  />
</Box> */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body1" style={{ color: '#333' }}>
              {fetchOnlyPublicCluster === "true" ? 'Current view: Public Clusters Only' : 'Current view: All Clusters'}
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={fetchOnlyPublicCluster === "false"}
                  onChange={handleToggle}
                  name="publicClusterSwitch"
                  color="primary"
                />
              }
              label="Show All Clusters"
              style={{ marginLeft: '10px' }}
            />
          </div>
        </div>
        {loading ? (
          <div className="loading-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', height: '100vh' }}>
            <CircularProgress color="secondary" />
            <div style={{ marginTop: '20px' }}>
            {fetchOnlyPublicCluster === "true" ? 
        "Please wait, loading may take up to 30 seconds." : 
        "Fetching all clusters. Please wait, this may take up to 3 minutes."
      }
    </div>
            <div style={{ marginTop: '20px' }}>{Math.round(percentage)}%</div>
            
          </div>
        ) : (
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Cluster Name</th>
                <th>Machine Name</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredDevices.map((device, index) => (
                <tr key={index}>
                  <td>{device.name}</td>
                  <td>{device.machineName}</td>
                  <td>
                    <button 
                      className="btn btn-outline-primary" 
                      disabled={loggingOffDevice === device.machineName}
                      onClick={() => handleLogOff(userName, device.machineName)}
                      style={{ position: 'relative' }}
                    >
 {loggingOffDevice === device.machineName ? (
          <>
            <CircularProgress size={24} style={{ position: 'absolute', top: '50%', left: '50%', marginTop: '-12px', marginLeft: '-12px', color: 'grey' }} />
            <span style={{ visibility: 'hidden' }}>Log Off</span> {/* Hide text to keep button size */}
          </>
        ) : (
          "Log Off"
        )}
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
