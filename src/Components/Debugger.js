import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import Footer from './Footer';
import '../App.css';
import { useTokenExchangeHandler } from "../shared/useTokenExchangeHandler";
import { Button, OverlayTrigger, Popover, Tooltip, Toast, Card, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faChevronDown, faChevronUp  } from '@fortawesome/free-solid-svg-icons';
import { Accordion } from 'react-bootstrap';
import './Debugger.css';

const Debugger = ({ token, userName, primaryAccount }) => {
  const [inputUserName, setInputUserName] = useState('');
  const [exchangeToken, setExchangeToken] = useState("");
  const [data, setData] = useState(null);
  const [showToast, setShowToast] = useState(true);
  const [shouldFetch, setShouldFetch] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [activeResourceIndex, setActiveResourceIndex] = useState(null);

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
        setIsLoading(true);
      }
    };

    fetchAdminStatus();
  }, [exchangeToken, userName]); // This effect depends on token and userName
  
  useEffect(() => {
    if (shouldFetch && exchangeToken.length != 0) {
      fetch('https://rdgateway-backend-test.app.cern.ch/api/debugger/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: "Bearer " + exchangeToken },
        body: JSON.stringify({ Username: inputUserName }),
      })
      .then(response => {
        if (response.ok) {
          return response.json();
        }
        throw new Error('Network response was not ok.');
      })
      .then(fetchData => {
        // console.log(data);
        setData(fetchData);
        setShouldFetch(false);
        setIsFetching(false);
      })
      .catch(error => {
        console.error('Error fetching initial lock statuses:', error)
        Swal.fire('Error', 'Could not fetch user logs.', 'error');
        setShouldFetch(false);
        setIsFetching(false);
      });
    }
  }, [exchangeToken, shouldFetch]);

  const handleUserNameChange = (event) => {
    setInputUserName(event.target.value);
  };

  const handleUserNameSubmit = (event) => {
    event.preventDefault();
    setShouldFetch(true); 
    setIsFetching(true); // Set shouldFetch to true to initiate fetching
  };
  
  useEffect(() => {
    // Automatically hide the toast after 5 seconds (5000 milliseconds)
    const timer = setTimeout(() => {
      setShowToast(false);
    }, 20000);

    return () => clearTimeout(timer);
  }, []);
  
  const popover = (
    <Popover id="popover-basic" style={{maxWidth: '1100px'}}>
      <Popover.Header as="h3">Help</Popover.Header>
      <Popover.Body>
        This webpage allows debugging users' Remote Desktop Configuration.
        <br/><br/>
        Enter the username in the input bar to fetch users' info and click "Fetch User Info".
        <br/><br/>
        The Remote desktop Debugger will display three tables:<br/>
        &emsp;1. Database: RAP Content - This table displays user {userName} configuration from the database.<br/>
        &emsp;2. Gateway Servers Local Groups Content - This will display the content of the LG-{userName} local group for each gateway server.<br/>
        &emsp;3. Database: RAP Resources Content - This will display all device configurations for {userName} from the database.<br/>
        <br/>
        How to use:<br/>
        &emsp;Check-in Database: RAP Content for the given user:<br/>
        &emsp;&emsp;1. Synchronized - If false, synchronization is not complete, or it has failed.<br/>
        &emsp;&emsp;2. To delete - This user is marked to be deleted by the synchronizer.<br/>
        &emsp;&emsp;3. Unsynchronized Gateways label - If it is not empty, there is a failed policy synchronization on a given gateway.<br/>
        &emsp;&emsp;4. Enabled - If false, the user is marked as invalid, and the synchronizer is ignoring it for this report to the support.
            <br/><br/>
            &emsp;Check-in Gateway Servers Local Groups Content in each gateway for:<br/>
            &emsp;&emsp;1. missing the members - Synchronization skipped the gateway due to an error, or the Cleanup removed the data.<br/>
            &emsp;&emsp;2. SID orphaned members - Residue from obsolete devices/accounts.
            <br/><br/>
            &emsp;Check-in Database: RAP Resources Content for each device:<br/>
            &emsp;&emsp;1. Synchronized flag - If false, synchronization is not complete, or it has failed.<br/>
            &emsp;&emsp;2. Incomplete sync flag - If true, the user needs to manually complete synchronization as described in the Help button on Remote Desktop Gateway.<br/>
            &emsp;&emsp;3. Unsynchronized Gateways label - If it is not empty, there is a failed Local Group synchronization on a given gateway.<br/>
            &emsp;&emsp;4. Invalid - If true, the device is marked as invalid, and the synchronizer is ignoring it for this report to the support.<br/>
            &emsp;&emsp;5. Access - If false, access for the device is disabled for a given user; it can be turned on in Remote Desktop Gateway in Manage user access for a configured device by clicking the padlock icon. Only the responsible person or main user can use this feature.<br/>
            &emsp;&emsp;6. To delete - This device is marked to be deleted by the synchronizer.
            <br/><br/>
          If the synchronization flag is false for too long, the Unsynchronized Gateways label is not empty, members are missing from gateway servers, or a SID member exists - Restart (or ask the user to restart) the synchronization for the missing device. If the synchronization restart does not solve the problem, contact support.<br/>
          Restart is done by clicking the yellow restart button on Remote Desktop Gateway (go to Manage user access to restart synchronization of others' devices).
      </Popover.Body>
    </Popover>
    
  );
  
  const renderLGinfo = () => {
    if (!data || !data.LGinfo) return null;
    console.log(data.LGinfo);
    return (
      Object.keys(data.LGinfo).map((key, index) => (
        <Card key={index} className="mb-3">
          <Card.Header>{key}</Card.Header>
          <Card.Body>
            {data.LGinfo[key].length > 0 ? (
              <ul>
                {data.LGinfo[key].map((user, userIndex) => (
                  <li key={userIndex}>{user}</li>
                ))}
              </ul>
            ) : <p>No users.</p>}
          </Card.Body>
        </Card>
      ))
    );
  };

  const toggleResourceVisibility = (index) => {
    if (index === activeResourceIndex) {
      setActiveResourceIndex(null); // If the same index is clicked, hide the details
    } else {
      setActiveResourceIndex(index); // Otherwise, show the details for the clicked resource
    }
  };
  

  const renderRAPResourceContent = () => {
    if (!data || !data.rapResourceContentList) return null;
    return data.rapResourceContentList.map((resource, index) => (
      <Card key={index} className="mb-3">
        <Card.Header className="d-flex justify-content-between align-items-center" style={{ cursor: 'pointer' }} onClick={() => toggleResourceVisibility(index)}>
          {resource.resourceName}
          <FontAwesomeIcon icon={activeResourceIndex === index ? faChevronUp : faChevronDown} />
        </Card.Header>
        {activeResourceIndex === index && (
          <Card.Body>
            <p>Resource Owner: {resource.resourceOwner}</p>
            <p>Access: {resource.access ? 'Yes' : 'No'}</p>
            <p>Synchronized: {resource.synchronized ? 'Yes' : 'No'}</p>
            <p>Invalid: {resource.invalid ? 'Yes' : 'No'}</p>
            <p>Incomplete sync: {resource.exception ? 'Yes' : 'No'}</p>
            <p>To delete: {resource.toDelete ? 'Yes' : 'No'}</p>
            <p>Unsynchronized Gateways: {resource.unsynchronizedGateways || 'None'}</p>
          </Card.Body>
        )}
      </Card>
    ));
  };

  const renderRAPContent = () => {
    if (!data || !data.rapContent) return null;
    console.log(data.rapContent);
    const { enabled, resourceGroupName, synchronized, toDelete, unsynchronizedGateways } = data.rapContent;
    return (
      <Card className="mb-3">
        <Card.Header>Database: RAP Content</Card.Header>
        <Card.Body>
          <p>Enabled: {enabled ? 'Yes' : 'No'}</p>
          <p>Resource Group Name: {resourceGroupName}</p>
          <p>Synchronized: {synchronized ? 'Yes' : 'No'}</p>
          <p>To delete: {toDelete ? 'Yes' : 'No'}</p>
          <p>Unsynchronized Gateways: {unsynchronizedGateways || 'None'}</p>
        </Card.Body>
      </Card>
    );
  };

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
          <strong className="me-auto">Welcome to CERN Remote Desktop Debugger</strong>
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
          <h1 className="title" style={{ position: 'absolute', marginTop: '0', marginBottom: '0' }}>Debug User Configurations on Gateway Servers and Database</h1>
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
<button type="submit" className="btn" disabled={isFetching} style={{ background: '#4A90E2', color: 'white', borderRadius: '20px', border: 'none', padding: '10px 20px', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Fetch online sessions of the desired user">
  {isFetching ? (
    <>
      <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" style={{ marginRight: '5px' }} />
      Loading...
    </>
  ) : (
    'Fetch User Info'
  )}
</button>
  </div>
  </form>
  
  <div className="data-layout-container">
    {/* RAPContent section always on top */}
    <div className="rap-content-container">
      {renderRAPContent()}
    </div>

    {/* Main content area with LGinfo on the left and RAPResourceContent on the right */}
    <div className="main-content-area">
      <div className="lg-info-container">
      {data && data.rapContent ?(
        <h2 className="section-title">Gateway Servers Local Groups Content</h2>
      ) : (<></>)
      }
        {renderLGinfo()}
      </div>
      <div className="rap-resource-content-container">
      {data && data.rapContent ?(
        <h2 className="section-title">Database: RAP Resources Content</h2>
        ) : (<></>)
      }
        {renderRAPResourceContent()}
      </div>
    </div>
  </div>
        
      </div>
        {/* Existing form layout for entering username and help button */}
      <Footer />
    </div>
  );
};
export default Debugger;
