import React, { useState, useEffect } from 'react';
import AuthRibbon from './AuthRibbon';
import Swal from 'sweetalert2';
import Footer from './Footer';
import '../App.css';
import { useTokenExchangeHandler } from "../shared/useTokenExchangeHandler";
import { CircularProgress } from '@material-ui/core'; // Import a loading component
import Switch from '@material-ui/core/Switch'; // Import a Switch component for the toggle button
import { Typography, FormControlLabel, Box } from '@material-ui/core';
import { Button, OverlayTrigger, Popover, Modal, Tooltip, Toast } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome } from '@fortawesome/free-solid-svg-icons';


const LogUserOff = ({ token, userName, primaryAccount }) => {
  const [inputUserName, setInputUserName] = useState('');
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
  const [showToast, setShowToast] = useState(true);
  const [shouldFetch, setShouldFetch] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);


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

  useEffect(() => {
    
    if (!shouldFetch || exchangeToken.length === 0) return;
    let abortController = new AbortController(); // Better to define it inside the condition
    const signal = abortController.signal;
  
    const fetchData = async () => {
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
        const response = await fetch(`https://rdgateway-backend-test.app.cern.ch/api/log_session/trigger?username=${inputUserName}&fetchOnlyPublicCluster=${fetchOnlyPublicCluster}`, {
          method: "GET",
          headers: {
            Authorization: "Bearer " + exchangeToken
          },
          signal: signal
        });
  
        if (!response.ok) throw new Error('Failed to start session data generation process');
  
        console.log("Session data generation process started.");
        setTimeout(async () => {
          if (!abortController.signal.aborted) {
            console.log("Attempting to fetch result..."); // Debugging line
            await fetchResult();
            setLoading(false);
            setShouldFetch(false);
            console.log("Fetch result completed."); // Debugging line
          }
        }, waitTime);
  
        requestAnimationFrame(updatePercentage);
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Error starting session data generation process:', error);
          setLoading(false);
          setPercentage(0);
        }
      }
  }
    fetchData();
  
    return () => {
      abortController.abort(); // This makes sure the fetch is aborted when the component unmounts
    };
  }, [exchangeToken, fetchOnlyPublicCluster, waitTime, logOffTrigger, shouldFetch]);
  
  
  const handleUserNameChange = (event) => {
    setInputUserName(event.target.value);
  };

  const handleUserNameSubmit = (event) => {
    event.preventDefault();
    setShouldFetch(true); // Set shouldFetch to true to initiate fetching
  };

  const fetchResult = async () => {
    try {
      console.log(`Fetching results for ${inputUserName}`); // Debugging line
      const response = await fetch(`https://rdgateway-backend-test.app.cern.ch/api/log_session/result?username=${inputUserName}&fetchOnlyPublicCluster=${fetchOnlyPublicCluster}`, {
        method: "GET",
        headers: {
          Authorization: "Bearer " + exchangeToken
        }
      });
  
      if (!response.ok) {
        throw new Error('Failed to fetch');
      }
  
      const data = await response.json();
      console.log("Data fetched:", data); // Debugging line
  
      // Process and update state with fetched data
      const filteredDevices = data.filter(device => device.IsConnected === "True").map(device => ({
        name: device.ClusterName,
        serverName: device.serverName,
        machineName: device.MachineName
      }));
  
      setDevices(filteredDevices);
      setPercentage(100); // Consider moving this line if needed
    } catch (error) {
      console.error('Error fetching devices:', error);
      setLoading(false);
      Swal.fire({
        icon: 'error',
        title: 'Server is busy',
        text: 'Please refresh the page.',
        confirmButtonText: 'Refresh',
        preConfirm: () => {
          window.location.reload(); // Refresh the page when the user clicks "Refresh"
        }
      });
      // Handle error scenario
    } finally {
      setLoading(false); // Ensure this is always executed
    }
  };
  
  useEffect(() => {
    // Automatically hide the toast after 5 seconds (5000 milliseconds)
    const timer = setTimeout(() => {
      setShowToast(false);
    }, 20000);

    return () => clearTimeout(timer);
  }, []);

  const handleClusterSearchChange = (event) => {
    setClusterSearchText(event.target.value);
  };

  const handleMachineSearchChange = (event) => {
    setMachineSearchText(event.target.value);
  };


  const handleToggle = (event) => {
    setFetchOnlyPublicCluster(event.target.checked ? "false" : "true");
    setWaitTime(event.target.checked ? 250000 : 30000);
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
  
  const popover = (
    <Popover id="popover-basic" style={{maxWidth: '600px'}}>
      <Popover.Header as="h3">Help</Popover.Header>
      <Popover.Body>
        This webpage allows you to disconnect other users' sessions.
        <br/><br/>
        Enter the username in the input bar to fetch users' sessions and click "Fetch Sessions". After that, please wait around 30 seconds to fetch sessions from public clusters and around 4 minutes to fetch sessions from all clusters. This website allows you to disconnect your sessions.
        <br/><br/> 
        To fetch sessions from all clusters, use the "Show All Clusters" switch. It is OFF by default.
        <br/><br/> 
        To be able to disconnect other users' sessions, the account CERN\{userName} must be an Admin.
      </Popover.Body>
    </Popover>
    
  );
  
  const navigate = useNavigate(); // Initialize useNavigate hook

  // Function to navigate to home
  const navigateHome = () => {
    navigate('/'); // Navigate to the home route using navigate function
  };

  const renderTooltip = (props) => (
    <Tooltip id="button-tooltip" {...props}>
      Go to home page
    </Tooltip>
  );
  
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

  if (!isLoading && !isAdmin) {
    return (
      <div className="App">
        <div className="headerImage py-5">
          <h1 className="headerTitle text-center">CERN Remote Desktop Service</h1>
        </div>
        <div className="container my-5">
          <p className="lead text-center mb-5">You are not authorized to access this website!</p>
          {/* Optionally, you can add a spinner or loading animation here */}
        </div>
      </div>
    );
  }

  return (
    <div className="App">
                  <Toast
        onClose={() => setShowToast(false)}
        show={showToast}
        delay={5000}
        autohide
        style={{
          position: 'fixed',
          top: 60,
          right: 20,
          zIndex: 1050,
        }}
      >
        <Toast.Header>
          <strong className="me-auto">Welcome to CERN Log User Off</strong>
        </Toast.Header>
        <Toast.Body>If you're using this website for the first time, please read the instructions by clicking the help button.</Toast.Body>
      </Toast>
      <div className="headerImage">
        <h1 className="headerTitle">CERN Remote Desktop Service</h1>
      </div>
      <div className="container mt-4">
      <div className="d-flex justify-content-center align-items-center mb-3">
      <OverlayTrigger
      placement="right"
      delay={{ show: 250, hide: 400 }}
      overlay={renderTooltip}
    >
      <button
        onClick={navigateHome}
        style={{
          position: 'absolute',
          backgroundColor: '#6c757d',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          padding: '10px 15px',
          cursor: 'pointer',
          fontSize: '16px',
          marginRight: '1195px'
        }}
      >
        <FontAwesomeIcon icon={faHome} style={{ marginRight: '8px' }} />
        Home
      </button>
    </OverlayTrigger>
          <h1 className="title" style={{ position: 'absolute', marginTop: '0', marginBottom: '0' }}>Disconnect users from Remote Desktop Terminal Services clusters you manage.</h1>
      <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%', marginBottom: '10px' }}>
            <OverlayTrigger trigger="click" placement="left" overlay={popover} rootClose>
              <Button variant="secondary">Help</Button>
            </OverlayTrigger>
          </div>
      </div>
      <form onSubmit={handleUserNameSubmit} style={{ marginBottom: '20px' }}>
  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', background: '#e8f0fe', borderRadius: '25px', padding: '10px 15px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
    <input
      type="text"
      placeholder="Enter username"
      value={inputUserName}
      onChange={handleUserNameChange}
      style={{
        flex: 1,
        marginRight: '10px',
        border: 'none',
        outline: 'none',
        background: 'transparent',
        color: '#333',
        fontSize: '16px',
      }}
    />
    <button type="submit" className="btn" style={{ background: '#4A90E2', color: 'white', borderRadius: '20px', border: 'none', padding: '10px 20px', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'}} title="Fetch online sessions of the desired user">
      Fetch session
    </button>
  </div>
</form>
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
              title="Toggle Visibility: Show Public Clusters Only or Display All Clusters"
            />
          </div>
        </div>
        {loading ? (
          <div className="loading-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', height: '100vh' }}>
            <CircularProgress color="secondary" />
            <div style={{ marginTop: '20px' }}>
            {fetchOnlyPublicCluster === "true" ? 
        "Please wait, loading may take up to 30 seconds." : 
        "Fetching all clusters. Please wait, this may take up to 4 minutes."
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
export default LogUserOff;
